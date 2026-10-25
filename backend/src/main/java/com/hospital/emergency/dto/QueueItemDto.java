package com.hospital.emergency.dto;

import com.hospital.emergency.model.Severity;
import com.hospital.emergency.queue.PatientQueueEntry;

import java.time.Duration;
import java.time.LocalDateTime;

public class QueueItemDto {

    private Long patientId;
    private String patientIdentifier;
    private String fullName;
    private int age;
    private Severity severity;
    private int priorityRank;
    private String severityColor;
    private LocalDateTime arrivalTime;
    private long arrivalSequenceNumber;
    private String presentingComplaint;
    private int queuePosition;
    private long currentWaitMinutes;
    private boolean isDemo;

    public QueueItemDto() {
    }

    public static QueueItemDto fromEntry(PatientQueueEntry entry, int position, LocalDateTime referenceTime) {
        QueueItemDto dto = new QueueItemDto();
        dto.setPatientId(entry.getPatientId());
        dto.setPatientIdentifier(entry.getPatientIdentifier());
        dto.setFullName(entry.getFullName());
        dto.setAge(entry.getAge());
        dto.setSeverity(entry.getSeverity());
        dto.setPriorityRank(entry.getSeverity().getPriorityRank());
        dto.setSeverityColor(entry.getSeverity().getHexColor());
        dto.setArrivalTime(entry.getArrivalTime());
        dto.setArrivalSequenceNumber(entry.getArrivalSequenceNumber());
        dto.setPresentingComplaint(entry.getPresentingComplaint());
        dto.setQueuePosition(position);
        dto.setDemo(entry.isDemo());

        long waitMin = Duration.between(entry.getArrivalTime(), referenceTime).toMinutes();
        dto.setCurrentWaitMinutes(Math.max(0, waitMin));
        return dto;
    }

    // Getters and Setters
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

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public int getPriorityRank() {
        return priorityRank;
    }

    public void setPriorityRank(int priorityRank) {
        this.priorityRank = priorityRank;
    }

    public String getSeverityColor() {
        return severityColor;
    }

    public void setSeverityColor(String severityColor) {
        this.severityColor = severityColor;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public long getArrivalSequenceNumber() {
        return arrivalSequenceNumber;
    }

    public void setArrivalSequenceNumber(long arrivalSequenceNumber) {
        this.arrivalSequenceNumber = arrivalSequenceNumber;
    }

    public String getPresentingComplaint() {
        return presentingComplaint;
    }

    public void setPresentingComplaint(String presentingComplaint) {
        this.presentingComplaint = presentingComplaint;
    }

    public int getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(int queuePosition) {
        this.queuePosition = queuePosition;
    }

    public long getCurrentWaitMinutes() {
        return currentWaitMinutes;
    }

    public void setCurrentWaitMinutes(long currentWaitMinutes) {
        this.currentWaitMinutes = currentWaitMinutes;
    }

    public boolean isDemo() {
        return isDemo;
    }

    public void setDemo(boolean demo) {
        isDemo = demo;
    }
}
