package com.hospital.emergency.controller;

import com.hospital.emergency.dto.AnalyticsSummaryDto;
import com.hospital.emergency.dto.SeverityDistributionDto;
import com.hospital.emergency.dto.WaitingTimeMetricsDto;
import com.hospital.emergency.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Real-time emergency operations and wait-time statistics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level operations dashboard summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/waiting-times")
    @Operation(summary = "Get detailed waiting-time calculations, eligible populations, and hourly trends")
    public ResponseEntity<WaitingTimeMetricsDto> getWaitingTimeMetrics() {
        return ResponseEntity.ok(analyticsService.getWaitingTimeMetrics());
    }

    @GetMapping("/severity-distribution")
    @Operation(summary = "Get patient count and percentage distribution by severity category")
    public ResponseEntity<List<SeverityDistributionDto>> getSeverityDistribution() {
        return ResponseEntity.ok(analyticsService.getSeverityDistribution());
    }
}
