package com.hospital.emergency.service;

import com.hospital.emergency.dto.PatientRequestDto;
import com.hospital.emergency.dto.PatientResponseDto;
import com.hospital.emergency.exception.InvalidStateTransitionException;
import com.hospital.emergency.exception.TreatmentCapacityException;
import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.queue.EmergencyQueueEngine;
import com.hospital.emergency.queue.PatientQueueEntry;
import com.hospital.emergency.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class PatientServiceTest {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EmergencyQueueEngine queueEngine;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PatientService patientService;

    @BeforeEach
    void setUp() {
        patientRepository.deleteAll();
        queueEngine.clear();
    }

    @Test
    @DisplayName("Patient registration saves to DB and enqueues in PriorityQueue")
    void testPatientRegistration() {
        PatientRequestDto request = new PatientRequestDto(
                "John Doe", 45, "Male", "Chest discomfort", Severity.HIGH, "Triage notes here"
        );

        PatientResponseDto response = patientService.registerPatient(request, false);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getFullName()).isEqualTo("John Doe");
        assertThat(response.getSeverity()).isEqualTo(Severity.HIGH);
        assertThat(response.getStatus()).isEqualTo(PatientStatus.WAITING);
        assertThat(queueEngine.size()).isEqualTo(1);
        assertThat(queueEngine.contains(response.getId())).isTrue();
    }

    @Test
    @DisplayName("Starting treatment calculates actual wait duration and removes from queue")
    void testStartTreatmentCalculation() {
        LocalDateTime arrival = LocalDateTime.now().minusMinutes(35);
        Patient patient = new Patient("ED-001", "Alice", 30, "Female", "Asthma", Severity.HIGH,
                PatientStatus.WAITING, "Notes", arrival, 1L, false);
        Patient saved = patientRepository.save(patient);
        queueEngine.enqueue(new PatientQueueEntry(
                saved.getId(), saved.getPatientIdentifier(), saved.getFullName(), saved.getAge(),
                saved.getSeverity(), saved.getArrivalTime(), saved.getArrivalSequenceNumber(),
                saved.getPresentingComplaint(), false
        ));

        PatientResponseDto result = queueService.startTreatment(saved.getId());

        assertThat(result.getStatus()).isEqualTo(PatientStatus.IN_TREATMENT);
        assertThat(result.getTreatmentStartTime()).isNotNull();
        assertThat(result.getActualWaitDurationMinutes()).isGreaterThanOrEqualTo(34L);
        assertThat(queueEngine.contains(saved.getId())).isFalse();
    }

    @Test
    @DisplayName("Enforces treatment capacity and prevents duplicate concurrent treatment starts")
    void testTreatmentCapacityLimit() {
        Patient p1 = new Patient("ED-001", "Alice", 30, "Female", "Asthma", Severity.HIGH,
                PatientStatus.WAITING, "Notes", LocalDateTime.now(), 1L, false);
        Patient saved1 = patientRepository.save(p1);

        Patient p2 = new Patient("ED-002", "Bob", 40, "Male", "Sprain", Severity.LOW,
                PatientStatus.WAITING, "Notes", LocalDateTime.now(), 2L, false);
        Patient saved2 = patientRepository.save(p2);

        // Admit p1 into treatment bed
        queueService.startTreatment(saved1.getId());

        // Attempting to admit p2 while bed is occupied should throw TreatmentCapacityException
        assertThatThrownBy(() -> queueService.startTreatment(saved2.getId()))
                .isInstanceOf(TreatmentCapacityException.class)
                .hasMessageContaining("All treatment resources are currently occupied");
    }

    @Test
    @DisplayName("Prevents illegal status transition from WAITING directly to COMPLETED")
    void testIllegalTransitionWaitingToCompleted() {
        Patient patient = new Patient("ED-001", "Bob", 40, "Male", "Fever", Severity.LOW,
                PatientStatus.WAITING, "Notes", LocalDateTime.now(), 1L, false);
        Patient saved = patientRepository.save(patient);

        assertThatThrownBy(() -> patientService.updateStatus(saved.getId(), PatientStatus.COMPLETED))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("Illegal status transition");
    }

    @Test
    @DisplayName("Prevents completed patient from re-entering active queue")
    void testCompletedPatientCannotReenterQueue() {
        Patient patient = new Patient("ED-001", "Charlie", 50, "Male", "Sprain", Severity.LOW,
                PatientStatus.COMPLETED, "Discharged", LocalDateTime.now(), 1L, false);
        Patient saved = patientRepository.save(patient);

        assertThatThrownBy(() -> patientService.updateStatus(saved.getId(), PatientStatus.WAITING))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("Illegal status transition");
    }
}
