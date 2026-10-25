package com.hospital.emergency.queue;

import com.hospital.emergency.model.Severity;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * In-memory representation of an active patient in the emergency queue.
 * Optimized for queue scheduling and lookup operations.
 */
public class PatientQueueEntry {

    private final Long patientId;
    private final String patientIdentifier;
    private final String fullName;
    private final int age;
    private Severity severity;
    private final LocalDateTime arrivalTime;
    private final long arrivalSequenceNumber;
    private final String presentingComplaint;
    private final boolean isDemo;

    public PatientQueueEntry(Long patientId, String patientIdentifier, String fullName, int age,
                             Severity severity, LocalDateTime arrivalTime, long arrivalSequenceNumber,
                             String presentingComplaint, boolean isDemo) {
        this.patientId = Objects.requireNonNull(patientId, "patientId must not be null");
        this.patientIdentifier = patientIdentifier;
        this.fullName = fullName;
        this.age = age;
        this.severity = Objects.requireNonNull(severity, "severity must not be null");
        this.arrivalTime = Objects.requireNonNull(arrivalTime, "arrivalTime must not be null");
        this.arrivalSequenceNumber = arrivalSequenceNumber;
        this.presentingComplaint = presentingComplaint;
        this.isDemo = isDemo;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientIdentifier() {
        return patientIdentifier;
    }

    public String getFullName() {
        return fullName;
    }

    public int getAge() {
        return age;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = Objects.requireNonNull(severity, "severity must not be null");
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public long getArrivalSequenceNumber() {
        return arrivalSequenceNumber;
    }

    public String getPresentingComplaint() {
        return presentingComplaint;
    }

    public boolean isDemo() {
        return isDemo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PatientQueueEntry that = (PatientQueueEntry) o;
        return Objects.equals(patientId, that.patientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(patientId);
    }

    @Override
    public String toString() {
        return "PatientQueueEntry{" +
                "id=" + patientId +
                ", code='" + patientIdentifier + '\'' +
                ", name='" + fullName + '\'' +
                ", severity=" + severity +
                ", seq=" + arrivalSequenceNumber +
                '}';
    }
}
