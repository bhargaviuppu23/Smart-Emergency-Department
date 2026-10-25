package com.hospital.emergency.dto;

import com.hospital.emergency.model.QueueEvent;

import java.time.LocalDateTime;

public class QueueEventDto {

    private Long id;
    private Long patientId;
    private String patientIdentifier;
    private String eventType;
    private String description;
    private LocalDateTime timestamp;

    public QueueEventDto() {
    }

    public static QueueEventDto fromEntity(QueueEvent event) {
        QueueEventDto dto = new QueueEventDto();
        dto.setId(event.getId());
        dto.setPatientId(event.getPatientId());
        dto.setPatientIdentifier(event.getPatientIdentifier());
        dto.setEventType(event.getEventType());
        dto.setDescription(event.getDescription());
        dto.setTimestamp(event.getTimestamp());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientIdentifier() {
        return patientIdentifier;
    }

    public void setPatientIdentifier(String patientIdentifier) {
        this.patientIdentifier = patientIdentifier;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
