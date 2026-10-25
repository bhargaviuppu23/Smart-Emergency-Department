package com.hospital.emergency.dto;

import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;

import java.time.LocalDateTime;

public class PatientResponseDto {

    private Long id;
    private String patientIdentifier;
    private String fullName;
    private int age;
    private String gender;
    private String presentingComplaint;
    private Severity severity;
    private PatientStatus status;
    private String triageNotes;
    private LocalDateTime arrivalTime;
    private LocalDateTime treatmentStartTime;
    private LocalDateTime treatmentEndTime;
    private Long actualWaitDurationMinutes;
    private Long treatmentDurationMinutes;
    private long arrivalSequenceNumber;
    private Integer queuePosition;
    private boolean isDemo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PatientResponseDto() {
    }

    public static PatientResponseDto fromEntity(Patient patient, Integer queuePosition) {
        PatientResponseDto dto = new PatientResponseDto();
        dto.setId(patient.getId());
        dto.setPatientIdentifier(patient.getPatientIdentifier());
        dto.setFullName(patient.getFullName());
        dto.setAge(patient.getAge());
        dto.setGender(patient.getGender());
        dto.setPresentingComplaint(patient.getPresentingComplaint());
        dto.setSeverity(patient.getSeverity());
        dto.setStatus(patient.getStatus());
        dto.setTriageNotes(patient.getTriageNotes());
        dto.setArrivalTime(patient.getArrivalTime());
        dto.setTreatmentStartTime(patient.getTreatmentStartTime());
        dto.setTreatmentEndTime(patient.getTreatmentEndTime());
        dto.setActualWaitDurationMinutes(patient.getActualWaitDurationMinutes());
        dto.setTreatmentDurationMinutes(patient.getTreatmentDurationMinutes());
        dto.setArrivalSequenceNumber(patient.getArrivalSequenceNumber());
        dto.setQueuePosition(queuePosition);
        dto.setDemo(patient.isDemo());
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setUpdatedAt(patient.getUpdatedAt());
        return dto;
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

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
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
