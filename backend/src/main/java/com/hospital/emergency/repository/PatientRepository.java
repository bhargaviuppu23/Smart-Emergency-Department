package com.hospital.emergency.repository;

import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientIdentifier(String patientIdentifier);

    List<Patient> findByStatusOrderByArrivalSequenceNumberAsc(PatientStatus status);

    List<Patient> findByStatusIn(List<PatientStatus> statuses);

    long countByStatus(PatientStatus status);

    long countBySeverityAndStatus(Severity severity, PatientStatus status);

    @Query("SELECT MAX(p.arrivalSequenceNumber) FROM Patient p")
    Long findMaxArrivalSequenceNumber();

    @Query("SELECT p FROM Patient p WHERE " +
           "(:search IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.patientIdentifier) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:severity IS NULL OR p.severity = :severity) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Patient> findWithFilters(@Param("search") String search,
                                 @Param("severity") Severity severity,
                                 @Param("status") PatientStatus status,
                                 Pageable pageable);

    @Query("SELECT AVG(p.actualWaitDurationMinutes) FROM Patient p WHERE p.actualWaitDurationMinutes IS NOT NULL")
    Double findAverageWaitTimeMinutes();

    @Query("SELECT AVG(p.treatmentDurationMinutes) FROM Patient p WHERE p.treatmentDurationMinutes IS NOT NULL")
    Double findAverageTreatmentDurationMinutes();

    @Query("SELECT MIN(p.actualWaitDurationMinutes) FROM Patient p WHERE p.actualWaitDurationMinutes IS NOT NULL")
    Long findMinWaitTimeMinutes();

    @Query("SELECT MAX(p.actualWaitDurationMinutes) FROM Patient p WHERE p.actualWaitDurationMinutes IS NOT NULL")
    Long findMaxWaitTimeMinutes();

    List<Patient> findByIsDemoTrue();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByIsDemoTrue();
}
