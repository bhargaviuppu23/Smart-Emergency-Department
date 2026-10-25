package com.hospital.emergency.service;

import com.hospital.emergency.dto.QueueEventDto;
import com.hospital.emergency.model.QueueEvent;
import com.hospital.emergency.repository.QueueEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger log = LoggerFactory.getLogger(EventService.class);
    private final QueueEventRepository queueEventRepository;

    public EventService(QueueEventRepository queueEventRepository) {
        this.queueEventRepository = queueEventRepository;
    }

    @Transactional
    public QueueEvent recordEvent(Long patientId, String patientIdentifier, String eventType, String description) {
        QueueEvent event = new QueueEvent(patientId, patientIdentifier, eventType, description, LocalDateTime.now());
        log.info("EVENT [{}] Patient {}: {}", eventType, patientIdentifier, description);
        return queueEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<QueueEventDto> getRecentEvents(int limit) {
        return queueEventRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, Math.min(limit, 100)))
                .stream()
                .map(QueueEventDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QueueEventDto> getPatientEvents(Long patientId) {
        return queueEventRepository.findByPatientIdOrderByTimestampDesc(patientId)
                .stream()
                .map(QueueEventDto::fromEntity)
                .collect(Collectors.toList());
    }
}
