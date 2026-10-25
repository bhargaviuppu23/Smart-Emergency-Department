package com.hospital.emergency.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_identifier", columnList = "patientIdentifier", unique = true),
    @Index(name = "idx_patient_status", columnList = "status"),
    @Index(name = "idx_patient_severity", columnList = "severity"),
    @Index(name = "idx_patient_arrival_time", columnList = "arrivalTime")
})
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String patientIdentifier;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false)
    private int age;

    @Column(length = 24)
    private String gender;

    @Column(nullable = false, length = 255)
    private String presentingComplaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PatientStatus status;

    @Column(length = 1000)
    private String triageNotes;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    private LocalDateTime treatmentStartTime;

    private LocalDateTime treatmentEndTime;

    private Long actualWaitDurationMinutes;

    private Long treatmentDurationMinutes;

    @Column(nullable = false)
    private long arrivalSequenceNumber;

    @Column(nullable = false)
    private boolean isDemo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Patient() {
    }

    public Patient(String patientIdentifier, String fullName, int age, String gender,
                   String presentingComplaint, Severity severity, PatientStatus status,
                   String triageNotes, LocalDateTime arrivalTime, long arrivalSequenceNumber,
                   boolean isDemo) {
        this.patientIdentifier = patientIdentifier;
        this.fullName = fullName;
        this.age = age;
        this.gender = gender;
        this.presentingComplaint = presentingComplaint;
        this.severity = severity;
        this.status = status;
        this.triageNotes = triageNotes;
        this.arrivalTime = arrivalTime;
        this.arrivalSequenceNumber = arrivalSequenceNumber;
        this.isDemo = isDemo;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        if (this.arrivalTime == null) {
            this.arrivalTime = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientIdentifier() {
        return patientIdentifier;
    }

    public void setPatientIdentifier(String patientIdentifier) {
        this.patientIdentifier = patientIdentifier;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPresentingComplaint() {
        return presentingComplaint;
    }

    public void setPresentingComplaint(String presentingComplaint) {
        this.presentingComplaint = presentingComplaint;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public PatientStatus getStatus() {
        return status;
    }

    public void setStatus(PatientStatus status) {
        this.status = status;
    }

    public String getTriageNotes() {
        return triageNotes;
    }

    public void setTriageNotes(String triageNotes) {
        this.triageNotes = triageNotes;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public LocalDateTime getTreatmentStartTime() {
        return treatmentStartTime;
    }

    public void setTreatmentStartTime(LocalDateTime treatmentStartTime) {
        this.treatmentStartTime = treatmentStartTime;
    }

    public LocalDateTime getTreatmentEndTime() {
        return treatmentEndTime;
    }

    public void setTreatmentEndTime(LocalDateTime treatmentEndTime) {
        this.treatmentEndTime = treatmentEndTime;
    }

    public Long getActualWaitDurationMinutes() {
        return actualWaitDurationMinutes;
    }

    public void setActualWaitDurationMinutes(Long actualWaitDurationMinutes) {
        this.actualWaitDurationMinutes = actualWaitDurationMinutes;
    }

    public Long getTreatmentDurationMinutes() {
        return treatmentDurationMinutes;
    }

    public void setTreatmentDurationMinutes(Long treatmentDurationMinutes) {
        this.treatmentDurationMinutes = treatmentDurationMinutes;
    }

    public long getArrivalSequenceNumber() {
        return arrivalSequenceNumber;
    }

    public void setArrivalSequenceNumber(long arrivalSequenceNumber) {
        this.arrivalSequenceNumber = arrivalSequenceNumber;
    }

    public boolean isDemo() {
        return isDemo;
    }

    public void setDemo(boolean demo) {
        isDemo = demo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
