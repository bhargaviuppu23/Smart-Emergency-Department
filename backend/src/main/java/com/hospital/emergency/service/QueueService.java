package com.hospital.emergency.service;

import com.hospital.emergency.dto.PatientResponseDto;
import com.hospital.emergency.dto.QueueItemDto;
import com.hospital.emergency.exception.InvalidStateTransitionException;
import com.hospital.emergency.exception.ResourceNotFoundException;
import com.hospital.emergency.exception.TreatmentCapacityException;
import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.model.TreatmentSession;
import com.hospital.emergency.queue.EmergencyQueueEngine;
import com.hospital.emergency.queue.PatientQueueEntry;
import com.hospital.emergency.repository.PatientRepository;
import com.hospital.emergency.repository.TreatmentSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QueueService {

    private static final Logger log = LoggerFactory.getLogger(QueueService.class);

    private final EmergencyQueueEngine queueEngine;
    private final PatientRepository patientRepository;
    private final TreatmentSessionRepository treatmentSessionRepository;
    private final EventService eventService;

    @Value("${app.queue.treatment-capacity:1}")
    private int treatmentCapacity;

    public QueueService(EmergencyQueueEngine queueEngine,
                        PatientRepository patientRepository,
                        TreatmentSessionRepository treatmentSessionRepository,
                        EventService eventService) {
        this.queueEngine = queueEngine;
        this.patientRepository = patientRepository;
        this.treatmentSessionRepository = treatmentSessionRepository;
        this.eventService = eventService;
    }

    /**
     * Reconstructs the in-memory scheduling structures upon application startup.
     * Durable source of truth is the PostgreSQL/H2 database.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void reconstructQueueOnStartup() {
        log.info("Starting Emergency Department in-memory queue reconstruction from database...");
        queueEngine.clear();

        Long maxSeq = patientRepository.findMaxArrivalSequenceNumber();
        if (maxSeq != null) {
            queueEngine.ensureSequenceNumberAtLeast(maxSeq);
        }

        List<Patient> waitingPatients = patientRepository.findByStatusOrderByArrivalSequenceNumberAsc(PatientStatus.WAITING);
        for (Patient patient : waitingPatients) {
            PatientQueueEntry entry = new PatientQueueEntry(
                    patient.getId(),
                    patient.getPatientIdentifier(),
                    patient.getFullName(),
                    patient.getAge(),
                    patient.getSeverity(),
                    patient.getArrivalTime(),
                    patient.getArrivalSequenceNumber(),
                    patient.getPresentingComplaint(),
                    patient.isDemo()
            );
            queueEngine.enqueue(entry);
        }

        log.info("Queue reconstruction complete. Successfully loaded {} waiting patients into PriorityQueue.",
                queueEngine.size());
    }

    /**
     * Returns an ordered snapshot of active patients in the queue.
     */
    public List<QueueItemDto> getLiveQueue() {
        List<PatientQueueEntry> entries = queueEngine.getOrderedSnapshot();
        LocalDateTime now = LocalDateTime.now();
        List<QueueItemDto> result = new ArrayList<>(entries.size());
        for (int i = 0; i < entries.size(); i++) {
            result.add(QueueItemDto.fromEntry(entries.get(i), i + 1, now));
        }
        return result;
    }

    /**
     * Inspects the next highest-priority eligible patient without state mutation.
     */
    public Optional<QueueItemDto> peekNextEligible() {
        return queueEngine.peekNext()
                .map(entry -> QueueItemDto.fromEntry(entry, 1, LocalDateTime.now()));
    }

    /**
     * Begins treatment for the specified patient (or next eligible if null).
     * Enforces treatment room capacity and records timestamps.
     */
    @Transactional
    public synchronized PatientResponseDto startTreatment(Long patientId) {
        // Enforce treatment capacity (e.g. 1 active doctor/bed resource)
        long currentInTreatment = patientRepository.countByStatus(PatientStatus.IN_TREATMENT);
        if (currentInTreatment >= treatmentCapacity) {
            throw new TreatmentCapacityException(
                    "Cannot start treatment: All treatment resources are currently occupied (" +
                    currentInTreatment + "/" + treatmentCapacity + "). Please complete active treatment first."
            );
        }

        Patient patient;
        if (patientId == null) {
            // Pick highest priority from queue
            Optional<PatientQueueEntry> nextOpt = queueEngine.pollNext();
            if (nextOpt.isEmpty()) {
                throw new ResourceNotFoundException("No patients waiting in the queue.");
            }
            patient = patientRepository.findById(nextOpt.get().getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + nextOpt.get().getPatientId()));
        } else {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
            queueEngine.remove(patientId);
        }

        if (patient.getStatus() != PatientStatus.WAITING) {
            throw new InvalidStateTransitionException(
                    "Cannot start treatment for patient in status: " + patient.getStatus() + ". Patient must be WAITING."
            );
        }

        LocalDateTime now = LocalDateTime.now();
        patient.setStatus(PatientStatus.IN_TREATMENT);
        patient.setTreatmentStartTime(now);

        long waitMinutes = Duration.between(patient.getArrivalTime(), now).toMinutes();
        patient.setActualWaitDurationMinutes(Math.max(0, waitMinutes));

        Patient saved = patientRepository.save(patient);

        // Record Treatment Session
        TreatmentSession session = new TreatmentSession(saved.getId(), saved.getPatientIdentifier(), now);
        treatmentSessionRepository.save(session);

        eventService.recordEvent(
                saved.getId(),
                saved.getPatientIdentifier(),
                "TREATMENT_STARTED",
                String.format("Treatment started for %s (%s). Actual wait duration: %d minutes.",
                        saved.getFullName(), saved.getSeverity(), waitMinutes)
        );

        return PatientResponseDto.fromEntity(saved, null);
    }

    /**
     * Completes active treatment session and records total duration.
     */
    @Transactional
    public synchronized PatientResponseDto completeTreatment(Long patientId, String notes) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        if (patient.getStatus() != PatientStatus.IN_TREATMENT) {
            throw new InvalidStateTransitionException(
                    "Cannot complete treatment for patient in status: " + patient.getStatus() + ". Patient must be IN_TREATMENT."
            );
        }

        LocalDateTime now = LocalDateTime.now();
        patient.setStatus(PatientStatus.COMPLETED);
        patient.setTreatmentEndTime(now);

        LocalDateTime start = patient.getTreatmentStartTime() != null ? patient.getTreatmentStartTime() : patient.getArrivalTime();
        long durationMin = Duration.between(start, now).toMinutes();
        patient.setTreatmentDurationMinutes(Math.max(1, durationMin));

        Patient saved = patientRepository.save(patient);

        // Close treatment session
        Optional<TreatmentSession> sessionOpt = treatmentSessionRepository
                .findFirstByPatientIdAndEndTimeIsNullOrderByStartTimeDesc(patientId);
        if (sessionOpt.isPresent()) {
            TreatmentSession session = sessionOpt.get();
            session.setEndTime(now);
            session.setDurationMinutes(durationMin);
            if (notes != null && !notes.isBlank()) {
                session.setNotes(notes);
            }
            treatmentSessionRepository.save(session);
        }

        eventService.recordEvent(
                saved.getId(),
                saved.getPatientIdentifier(),
                "TREATMENT_COMPLETED",
                String.format("Treatment completed for %s. Treatment duration: %d minutes. Patient discharged.",
                        saved.getFullName(), durationMin)
        );

        return PatientResponseDto.fromEntity(saved, null);
    }

    /**
     * Cancels an active waiting or in-treatment patient safely.
     */
    @Transactional
    public synchronized PatientResponseDto cancelPatient(Long patientId, String reason) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        if (patient.getStatus() == PatientStatus.COMPLETED || patient.getStatus() == PatientStatus.CANCELLED) {
            throw new InvalidStateTransitionException(
                    "Cannot cancel patient already in terminal state: " + patient.getStatus()
            );
        }

        queueEngine.remove(patientId);
        patient.setStatus(PatientStatus.CANCELLED);
        Patient saved = patientRepository.save(patient);

        // Close any open treatment session
        Optional<TreatmentSession> sessionOpt = treatmentSessionRepository
                .findFirstByPatientIdAndEndTimeIsNullOrderByStartTimeDesc(patientId);
        if (sessionOpt.isPresent()) {
            TreatmentSession session = sessionOpt.get();
            session.setEndTime(LocalDateTime.now());
            session.setNotes("Cancelled: " + (reason != null ? reason : "Patient left or cancelled"));
            treatmentSessionRepository.save(session);
        }

        eventService.recordEvent(
                saved.getId(),
                saved.getPatientIdentifier(),
                "PATIENT_CANCELLED",
                String.format("Patient %s was cancelled. Reason: %s",
                        saved.getFullName(), (reason != null && !reason.isBlank() ? reason : "Not specified"))
        );

        return PatientResponseDto.fromEntity(saved, null);
    }

    /**
     * Enqueues a newly saved patient into the queue engine.
     */
    public void enqueuePatient(Patient patient) {
        if (patient.getStatus() == PatientStatus.WAITING) {
            PatientQueueEntry entry = new PatientQueueEntry(
                    patient.getId(),
                    patient.getPatientIdentifier(),
                    patient.getFullName(),
                    patient.getAge(),
                    patient.getSeverity(),
                    patient.getArrivalTime(),
                    patient.getArrivalSequenceNumber(),
                    patient.getPresentingComplaint(),
                    patient.isDemo()
            );
            queueEngine.enqueue(entry);
        }
    }

    /**
     * Re-triages a patient and reflects it immediately in the PriorityQueue.
     */
    public void retriageInQueue(Long patientId, Severity newSeverity) {
        queueEngine.updateSeverity(patientId, newSeverity);
    }

    public int getQueueSize() {
        return queueEngine.size();
    }

    public List<PatientQueueEntry> getFifoQueueForSeverity(Severity severity) {
        return queueEngine.getFifoQueueForSeverity(severity);
    }
}
