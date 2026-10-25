package com.hospital.emergency.controller;

import com.hospital.emergency.dto.PatientResponseDto;
import com.hospital.emergency.dto.QueueItemDto;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.queue.PatientQueueEntry;
import com.hospital.emergency.service.QueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@Tag(name = "Queue Engine", description = "Live PriorityQueue and FIFO Engine Operations")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    @Operation(summary = "Get live ordered queue snapshot", description = "Returns active waiting patients sorted by Severity rank then chronological FIFO tie-breaker.")
    public ResponseEntity<List<QueueItemDto>> getLiveQueue() {
        return ResponseEntity.ok(queueService.getLiveQueue());
    }

    @GetMapping("/next")
    @Operation(summary = "Inspect next eligible patient at the top of PriorityQueue")
    public ResponseEntity<QueueItemDto> peekNext() {
        return queueService.peekNextEligible()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/start-next")
    @Operation(summary = "Admit the highest-priority waiting patient into treatment")
    public ResponseEntity<PatientResponseDto> startNext() {
        return ResponseEntity.ok(queueService.startTreatment(null));
    }

    @GetMapping("/fifo/{severity}")
    @Operation(summary = "Inspect internal FIFO Deque for a specific severity tier", description = "Demonstrates FIFO sub-queue behavior for patients sharing the same priority rank.")
    public ResponseEntity<List<PatientQueueEntry>> getFifoForSeverity(@PathVariable Severity severity) {
        return ResponseEntity.ok(queueService.getFifoQueueForSeverity(severity));
    }
}
