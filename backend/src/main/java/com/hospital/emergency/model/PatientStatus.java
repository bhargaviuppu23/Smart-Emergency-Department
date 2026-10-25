package com.hospital.emergency.model;

/**
 * State lifecycle of a patient in the Emergency Department workflow.
 */
public enum PatientStatus {
    WAITING("Waiting in Queue", true),
    IN_TREATMENT("In Active Treatment", false),
    COMPLETED("Treatment Completed / Discharged", false),
    CANCELLED("Cancelled / Left Without Being Seen", false);

    private final String label;
    private final boolean inQueue;

    PatientStatus(String label, boolean inQueue) {
        this.label = label;
        this.inQueue = inQueue;
    }

    public String getLabel() {
        return label;
    }

    public boolean isInQueue() {
        return inQueue;
    }

    /**
     * Verifies if transition from this state to target state is permissible.
     */
    public boolean canTransitionTo(PatientStatus target) {
        if (this == target) {
            return true;
        }
        return switch (this) {
            case WAITING -> (target == IN_TREATMENT || target == CANCELLED);
            case IN_TREATMENT -> (target == COMPLETED || target == CANCELLED);
            case COMPLETED, CANCELLED -> false; // Terminal states
        };
    }
}
