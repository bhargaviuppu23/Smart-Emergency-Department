package com.hospital.emergency.dto;

import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;

import java.util.Map;

public class AnalyticsSummaryDto {

    private long totalRegistered;
    private long waitingCount;
    private long criticalCount;
    private long highPriorityCount;
    private long inTreatmentCount;
    private long completedCount;
    private long cancelledCount;
    private Double averageWaitMinutes;
    private Double averageTreatmentMinutes;
    private Long minWaitMinutes;
    private Long maxWaitMinutes;
    private Map<Severity, Long> severityCounts;
    private Map<PatientStatus, Long> statusCounts;

    public AnalyticsSummaryDto() {
    }

    public long getTotalRegistered() {
        return totalRegistered;
    }

    public void setTotalRegistered(long totalRegistered) {
        this.totalRegistered = totalRegistered;
    }

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }

    public long getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(long criticalCount) {
        this.criticalCount = criticalCount;
    }

    public long getHighPriorityCount() {
        return highPriorityCount;
    }

    public void setHighPriorityCount(long highPriorityCount) {
        this.highPriorityCount = highPriorityCount;
    }

    public long getInTreatmentCount() {
        return inTreatmentCount;
    }

    public void setInTreatmentCount(long inTreatmentCount) {
        this.inTreatmentCount = inTreatmentCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public long getCancelledCount() {
        return cancelledCount;
    }

    public void setCancelledCount(long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }

    public Double getAverageWaitMinutes() {
        return averageWaitMinutes;
    }

    public void setAverageWaitMinutes(Double averageWaitMinutes) {
        this.averageWaitMinutes = averageWaitMinutes;
    }

    public Double getAverageTreatmentMinutes() {
        return averageTreatmentMinutes;
    }

    public void setAverageTreatmentMinutes(Double averageTreatmentMinutes) {
        this.averageTreatmentMinutes = averageTreatmentMinutes;
    }

    public Long getMinWaitMinutes() {
        return minWaitMinutes;
    }

    public void setMinWaitMinutes(Long minWaitMinutes) {
        this.minWaitMinutes = minWaitMinutes;
    }

    public Long getMaxWaitMinutes() {
        return maxWaitMinutes;
    }

    public void setMaxWaitMinutes(Long maxWaitMinutes) {
        this.maxWaitMinutes = maxWaitMinutes;
    }

    public Map<Severity, Long> getSeverityCounts() {
        return severityCounts;
    }

    public void setSeverityCounts(Map<Severity, Long> severityCounts) {
        this.severityCounts = severityCounts;
    }

    public Map<PatientStatus, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<PatientStatus, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }
}
