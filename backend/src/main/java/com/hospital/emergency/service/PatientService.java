package com.hospital.emergency.service;

import com.hospital.emergency.dto.PatientRequestDto;
import com.hospital.emergency.dto.PatientResponseDto;
import com.hospital.emergency.dto.UpdatePatientDto;
import com.hospital.emergency.exception.InvalidStateTransitionException;
import com.hospital.emergency.exception.ResourceNotFoundException;
import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.queue.EmergencyQueueEngine;
import com.hospital.emergency.queue.PatientQueueEntry;
import com.hospital.emergency.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository patientRepository;
    private final EmergencyQueueEngine queueEngine;
    private final QueueService queueService;
    private final EventService eventService;

    public PatientService(PatientRepository patientRepository,
                          EmergencyQueueEngine queueEngine,
                          QueueService queueService,
                          EventService eventService) {
        this.patientRepository = patientRepository;
        this.queueEngine = queueEngine;
        this.queueService = queueService;
        this.eventService = eventService;
    }

    @Transactional
    public PatientResponseDto registerPatient(PatientRequestDto request, boolean isDemo) {
        long sequenceNumber = queueEngine.nextSequenceNumber();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String identifier = String.format("ED-%s-%04d", datePrefix, sequenceNumber % 10000);

        LocalDateTime now = LocalDateTime.now();

        Patient patient = new Patient(
                identifier,
                request.getFullName().trim(),
                request.getAge(),
                request.getGender() != null ? request.getGender().trim() : null,
                request.getPresentingComplaint().trim(),
                request.getSeverity(),
                PatientStatus.WAITING,
                request.getTriageNotes() != null ? request.getTriageNotes().trim() : null,
                now,
                sequenceNumber,
                isDemo
        );

        Patient saved = patientRepository.save(patient);

        // Add to in-memory priority queue
        queueService.enqueuePatient(saved);

        // Log audit event
        eventService.recordEvent(
                saved.getId(),
                saved.getPatientIdentifier(),
                "PATIENT_REGISTERED",
                String.format("Patient %s registered with triage severity %s. Assigned queue sequence #%d.",
                        saved.getFullName(), saved.getSeverity(), sequenceNumber)
        );

        int position = calculateQueuePosition(saved.getId());
        return PatientResponseDto.fromEntity(saved, position);
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        Integer position = patient.getStatus() == PatientStatus.WAITING ? calculateQueuePosition(id) : null;
        return PatientResponseDto.fromEntity(patient, position);
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getPatientByIdentifier(String identifier) {
        Patient patient = patientRepository.findByPatientIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with identifier: " + identifier));
        Integer position = patient.getStatus() == PatientStatus.WAITING ? calculateQueuePosition(patient.getId()) : null;
        return PatientResponseDto.fromEntity(patient, position);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponseDto> getPatients(String search, Severity severity, PatientStatus status,
                                               int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);

        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return patientRepository.findWithFilters(searchParam, severity, status, pageable)
                .map(p -> {
                    Integer position = p.getStatus() == PatientStatus.WAITING ? calculateQueuePosition(p.getId()) : null;
                    return PatientResponseDto.fromEntity(p, position);
                });
    }

    @Transactional
    public PatientResponseDto updatePatient(Long id, UpdatePatientDto updateDto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        boolean severityChanged = false;
        Severity oldSeverity = patient.getSeverity();

        if (updateDto.getPresentingComplaint() != null && !updateDto.getPresentingComplaint().isBlank()) {
            patient.setPresentingComplaint(updateDto.getPresentingComplaint().trim());
        }

        if (updateDto.getTriageNotes() != null) {
            patient.setTriageNotes(updateDto.getTriageNotes().trim());
        }

        if (updateDto.getSeverity() != null && updateDto.getSeverity() != patient.getSeverity()) {
            severityChanged = true;
            patient.setSeverity(updateDto.getSeverity());
        }

        Patient saved = patientRepository.save(patient);

        if (severityChanged) {
            if (saved.getStatus() == PatientStatus.WAITING) {
                queueService.retriageInQueue(saved.getId(), saved.getSeverity());
            }
            eventService.recordEvent(
                    saved.getId(),
                    saved.getPatientIdentifier(),
                    "TRIAGE_UPDATED",
                    String.format("Triage severity updated from %s to %s.", oldSeverity, saved.getSeverity())
            );
        } else {
            eventService.recordEvent(
                    saved.getId(),
                    saved.getPatientIdentifier(),
                    "RECORD_UPDATED",
                    "Patient record information updated."
            );
        }

        Integer position = saved.getStatus() == PatientStatus.WAITING ? calculateQueuePosition(saved.getId()) : null;
        return PatientResponseDto.fromEntity(saved, position);
    }

    @Transactional
    public PatientResponseDto updateStatus(Long id, PatientStatus newStatus) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        if (!patient.getStatus().canTransitionTo(newStatus)) {
            throw new InvalidStateTransitionException(
                    String.format("Illegal status transition from %s to %s.", patient.getStatus(), newStatus)
            );
        }

        return switch (newStatus) {
            case IN_TREATMENT -> queueService.startTreatment(id);
            case COMPLETED -> queueService.completeTreatment(id, "Discharged after completed care.");
            case CANCELLED -> queueService.cancelPatient(id, "Status manually updated to CANCELLED.");
            case WAITING -> throw new InvalidStateTransitionException("Cannot move patient back into WAITING status.");
        };
    }

    private Integer calculateQueuePosition(Long patientId) {
        List<PatientQueueEntry> snapshot = queueEngine.getOrderedSnapshot();
        for (int i = 0; i < snapshot.size(); i++) {
            if (snapshot.get(i).getPatientId().equals(patientId)) {
                return i + 1;
            }
        }
        return null;
    }
}
