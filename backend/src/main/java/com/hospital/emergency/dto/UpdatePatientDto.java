package com.hospital.emergency.dto;

import com.hospital.emergency.model.Severity;
import jakarta.validation.constraints.Size;

public class UpdatePatientDto {

    @Size(max = 255, message = "Complaint cannot exceed 255 characters")
    private String presentingComplaint;

    private Severity severity;

    @Size(max = 1000, message = "Triage notes cannot exceed 1000 characters")
    private String triageNotes;

    public UpdatePatientDto() {
    }

    public UpdatePatientDto(String presentingComplaint, Severity severity, String triageNotes) {
        this.presentingComplaint = presentingComplaint;
        this.severity = severity;
        this.triageNotes = triageNotes;
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

    public String getTriageNotes() {
        return triageNotes;
    }

    public void setTriageNotes(String triageNotes) {
        this.triageNotes = triageNotes;
    }
}
