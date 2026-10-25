package com.hospital.emergency.model;

/**
 * Triage severity categories based on the Emergency Severity Index (ESI) principles.
 * Lower priorityRank indicates higher medical urgency.
 */
public enum Severity {
    CRITICAL(1, "Critical - Immediate Life Threat", "#DC2626"),
    HIGH(2, "High - Emergent / Severe Distress", "#EA580C"),
    MEDIUM(3, "Medium - Urgent / Stable", "#D97706"),
    LOW(4, "Low - Non-Urgent / Routine", "#059669");

    private final int priorityRank;
    private final String description;
    private final String hexColor;

    Severity(int priorityRank, String description, String hexColor) {
        this.priorityRank = priorityRank;
        this.description = description;
        this.hexColor = hexColor;
    }

    public int getPriorityRank() {
        return priorityRank;
    }

    public String getDescription() {
        return description;
    }

    public String getHexColor() {
        return hexColor;
    }
}
