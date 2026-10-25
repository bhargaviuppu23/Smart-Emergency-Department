package com.hospital.emergency.dto;

import com.hospital.emergency.model.Severity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PatientRequestDto {

    @NotBlank(message = "Patient name is required")
    @Size(max = 120, message = "Name cannot exceed 120 characters")
    private String fullName;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 130, message = "Age must be realistic (0-130)")
    private Integer age;

    @Size(max = 24, message = "Gender cannot exceed 24 characters")
    private String gender;

    @NotBlank(message = "Presenting complaint is required")
    @Size(max = 255, message = "Complaint cannot exceed 255 characters")
    private String presentingComplaint;

    @NotNull(message = "Severity category is required")
    private Severity severity;

    @Size(max = 1000, message = "Triage notes cannot exceed 1000 characters")
    private String triageNotes;

    public PatientRequestDto() {
    }

    public PatientRequestDto(String fullName, Integer age, String gender, String presentingComplaint, Severity severity, String triageNotes) {
        this.fullName = fullName;
        this.age = age;
        this.gender = gender;
        this.presentingComplaint = presentingComplaint;
        this.severity = severity;
        this.triageNotes = triageNotes;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
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

    public String getTriageNotes() {
        return triageNotes;
    }

    public void setTriageNotes(String triageNotes) {
        this.triageNotes = triageNotes;
    }
}
