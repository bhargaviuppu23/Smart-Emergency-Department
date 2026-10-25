package com.hospital.emergency.dto;

import java.util.List;
import java.util.Map;

public class WaitingTimeMetricsDto {

    private String calculationDefinition;
    private Double averageWaitMinutes;
    private Long minWaitMinutes;
    private Long maxWaitMinutes;
    private Double averageTreatmentDurationMinutes;
    private long eligiblePatientCount;
    private Map<String, Double> averageWaitBySeverity;
    private List<HourlyTrendDto> hourlyVolumeTrends;

    public WaitingTimeMetricsDto() {
    }

    public static class HourlyTrendDto {
        private String timeSlot;
        private long arrivals;
        private long completions;

        public HourlyTrendDto() {}

        public HourlyTrendDto(String timeSlot, long arrivals, long completions) {
            this.timeSlot = timeSlot;
            this.arrivals = arrivals;
            this.completions = completions;
        }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public long getArrivals() { return arrivals; }
        public void setArrivals(long arrivals) { this.arrivals = arrivals; }
        public long getCompletions() { return completions; }
        public void setCompletions(long completions) { this.completions = completions; }
    }

    public String getCalculationDefinition() {
        return calculationDefinition;
    }

    public void setCalculationDefinition(String calculationDefinition) {
        this.calculationDefinition = calculationDefinition;
    }

    public Double getAverageWaitMinutes() {
        return averageWaitMinutes;
    }

    public void setAverageWaitMinutes(Double averageWaitMinutes) {
        this.averageWaitMinutes = averageWaitMinutes;
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

    public Double getAverageTreatmentDurationMinutes() {
        return averageTreatmentDurationMinutes;
    }

    public void setAverageTreatmentDurationMinutes(Double averageTreatmentDurationMinutes) {
        this.averageTreatmentDurationMinutes = averageTreatmentDurationMinutes;
    }

    public long getEligiblePatientCount() {
        return eligiblePatientCount;
    }

    public void setEligiblePatientCount(long eligiblePatientCount) {
        this.eligiblePatientCount = eligiblePatientCount;
    }

    public Map<String, Double> getAverageWaitBySeverity() {
        return averageWaitBySeverity;
    }

    public void setAverageWaitBySeverity(Map<String, Double> averageWaitBySeverity) {
        this.averageWaitBySeverity = averageWaitBySeverity;
    }

    public List<HourlyTrendDto> getHourlyVolumeTrends() {
        return hourlyVolumeTrends;
    }

    public void setHourlyVolumeTrends(List<HourlyTrendDto> hourlyVolumeTrends) {
        this.hourlyVolumeTrends = hourlyVolumeTrends;
    }
}
