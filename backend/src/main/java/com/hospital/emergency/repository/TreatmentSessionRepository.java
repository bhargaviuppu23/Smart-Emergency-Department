package com.hospital.emergency.repository;

import com.hospital.emergency.model.TreatmentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentSessionRepository extends JpaRepository<TreatmentSession, Long> {

    List<TreatmentSession> findByPatientIdOrderByStartTimeDesc(Long patientId);

    Optional<TreatmentSession> findFirstByPatientIdAndEndTimeIsNullOrderByStartTimeDesc(Long patientId);

    List<TreatmentSession> findByEndTimeIsNull();
}
