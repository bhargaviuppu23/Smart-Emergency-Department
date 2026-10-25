package com.hospital.emergency.controller;

import com.hospital.emergency.dto.QueueEventDto;
import com.hospital.emergency.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Audit & Queue Events", description = "Timeline and audit trail of triage events and status changes")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    @Operation(summary = "Get recent queue events across the department")
    public ResponseEntity<List<QueueEventDto>> getRecentEvents(@RequestParam(defaultValue = "30") int limit) {
        return ResponseEntity.ok(eventService.getRecentEvents(limit));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get audit trail for a specific patient ID")
    public ResponseEntity<List<QueueEventDto>> getPatientEvents(@PathVariable Long patientId) {
        return ResponseEntity.ok(eventService.getPatientEvents(patientId));
    }
}
