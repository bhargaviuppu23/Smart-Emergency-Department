package com.hospital.emergency.controller;

import com.hospital.emergency.dto.DemoGenerateDto;
import com.hospital.emergency.dto.PatientResponseDto;
import com.hospital.emergency.model.Patient;
import com.hospital.emergency.service.DemoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/demo")
@Tag(name = "Simulation & Demo Mode", description = "Generate realistic fictional simulation patients and reset test datasets")
public class DemoController {

    private final DemoService demoService;

    public DemoController(DemoService demoService) {
        this.demoService = demoService;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate fictional emergency simulation records", description = "Creates clearly marked demo patients with varied triage severities and arrival offsets.")
    public ResponseEntity<List<PatientResponseDto>> generateDemo(@Valid @RequestBody(required = false) DemoGenerateDto request) {
        DemoGenerateDto req = request != null ? request : new DemoGenerateDto();
        List<Patient> created = demoService.generateDemoPatients(req);
        List<PatientResponseDto> dtos = created.stream()
                .map(p -> PatientResponseDto.fromEntity(p, null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/reset")
    @Operation(summary = "Reset and purge all simulation demo records", description = "Removes all records marked isDemo and synchronizes in-memory queue state.")
    public ResponseEntity<Map<String, String>> resetDemo() {
        demoService.resetDemoPatients();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "All simulation demo patients have been safely removed. Active queue reconciled."
        ));
    }
}
