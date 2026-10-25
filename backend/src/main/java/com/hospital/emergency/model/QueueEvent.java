package com.hospital.emergency.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_events", indexes = {
    @Index(name = "idx_event_patient_id", columnList = "patientId"),
    @Index(name = "idx_event_timestamp", columnList = "timestamp")
})
public class QueueEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    @Column(length = 32)
    private String patientIdentifier;

    @Column(nullable = false, length = 60)
    private String eventType;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public QueueEvent() {
    }

    public QueueEvent(Long patientId, String patientIdentifier, String eventType, String description, LocalDateTime timestamp) {
        this.patientId = patientId;
        this.patientIdentifier = patientIdentifier;
        this.eventType = eventType;
        this.description = description;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
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
