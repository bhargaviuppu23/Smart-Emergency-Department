package com.hospital.emergency.dto;

import com.hospital.emergency.model.Severity;

public class SeverityDistributionDto {

    private Severity severity;
    private String label;
    private int priorityRank;
    private String color;
    private long count;
    private double percentage;

    public SeverityDistributionDto() {
    }

    public SeverityDistributionDto(Severity severity, long count, double percentage) {
        this.severity = severity;
        this.label = severity.name();
        this.priorityRank = severity.getPriorityRank();
        this.color = severity.getHexColor();
        this.count = count;
        this.percentage = percentage;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getPriorityRank() {
        return priorityRank;
    }

    public void setPriorityRank(int priorityRank) {
        this.priorityRank = priorityRank;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
