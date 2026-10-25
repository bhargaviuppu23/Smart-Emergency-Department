package com.hospital.emergency.repository;

import com.hospital.emergency.model.QueueEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueEventRepository extends JpaRepository<QueueEvent, Long> {

    List<QueueEvent> findByPatientIdOrderByTimestampDesc(Long patientId);

    List<QueueEvent> findAllByOrderByTimestampDesc(Pageable pageable);
}
