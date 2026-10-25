package com.hospital.emergency.controller;

import com.hospital.emergency.dto.PatientRequestDto;
import com.hospital.emergency.dto.PatientResponseDto;
import com.hospital.emergency.dto.UpdatePatientDto;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.service.PatientService;
import com.hospital.emergency.service.QueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patients", description = "Emergency Department Patient Registration and Record Lifecycle")
public class PatientController {

    private final PatientService patientService;
    private final QueueService queueService;

    public PatientController(PatientService patientService, QueueService queueService) {
        this.patientService = patientService;
        this.queueService = queueService;
    }

    @PostMapping
    @Operation(summary = "Register a new emergency patient", description = "Validates triage information, assigns a unique identifier and sequence, enqueues into PriorityQueue.")
    public ResponseEntity<PatientResponseDto> registerPatient(@Valid @RequestBody PatientRequestDto request) {
        PatientResponseDto created = patientService.registerPatient(request, false);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search and filter patient records", description = "Supports pagination and filtering by search query, severity, and status.")
    public ResponseEntity<Page<PatientResponseDto>> getPatients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) PatientStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "arrivalTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(patientService.getPatients(search, severity, status, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient record by database ID")
    public ResponseEntity<PatientResponseDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update patient clinical notes or re-triage severity")
    public ResponseEntity<PatientResponseDto> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientDto updateDto) {
        return ResponseEntity.ok(patientService.updatePatient(id, updateDto));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update patient lifecycle status with strict transition validation")
    public ResponseEntity<PatientResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        if (statusStr == null) {
            throw new IllegalArgumentException("Status field is required");
        }
        PatientStatus status = PatientStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(patientService.updateStatus(id, status));
    }

    @PostMapping("/{id}/start-treatment")
    @Operation(summary = "Admit waiting patient into active treatment bed")
    public ResponseEntity<PatientResponseDto> startTreatment(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.startTreatment(id));
    }

    @PostMapping("/{id}/complete-treatment")
    @Operation(summary = "Complete active treatment and discharge patient")
    public ResponseEntity<PatientResponseDto> completeTreatment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String notes = payload != null ? payload.get("notes") : null;
        return ResponseEntity.ok(queueService.completeTreatment(id, notes));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel active patient from queue or care")
    public ResponseEntity<PatientResponseDto> cancelPatient(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : null;
        return ResponseEntity.ok(queueService.cancelPatient(id, reason));
    }
}
