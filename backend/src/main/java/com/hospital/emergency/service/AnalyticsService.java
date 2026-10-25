package com.hospital.emergency.service;

import com.hospital.emergency.dto.AnalyticsSummaryDto;
import com.hospital.emergency.dto.SeverityDistributionDto;
import com.hospital.emergency.dto.WaitingTimeMetricsDto;
import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final PatientRepository patientRepository;

    public AnalyticsService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getSummary() {
        AnalyticsSummaryDto summary = new AnalyticsSummaryDto();

        long total = patientRepository.count();
        long waiting = patientRepository.countByStatus(PatientStatus.WAITING);
        long inTreatment = patientRepository.countByStatus(PatientStatus.IN_TREATMENT);
        long completed = patientRepository.countByStatus(PatientStatus.COMPLETED);
        long cancelled = patientRepository.countByStatus(PatientStatus.CANCELLED);

        long critical = patientRepository.countBySeverityAndStatus(Severity.CRITICAL, PatientStatus.WAITING);
        long high = patientRepository.countBySeverityAndStatus(Severity.HIGH, PatientStatus.WAITING);

        Double avgWait = patientRepository.findAverageWaitTimeMinutes();
        Double avgTreatment = patientRepository.findAverageTreatmentDurationMinutes();
        Long minWait = patientRepository.findMinWaitTimeMinutes();
        Long maxWait = patientRepository.findMaxWaitTimeMinutes();

        Map<Severity, Long> severityCounts = new EnumMap<>(Severity.class);
        for (Severity s : Severity.values()) {
            severityCounts.put(s, patientRepository.countBySeverityAndStatus(s, PatientStatus.WAITING));
        }

        Map<PatientStatus, Long> statusCounts = new EnumMap<>(PatientStatus.class);
        for (PatientStatus s : PatientStatus.values()) {
            statusCounts.put(s, patientRepository.countByStatus(s));
        }

        summary.setTotalRegistered(total);
        summary.setWaitingCount(waiting);
        summary.setInTreatmentCount(inTreatment);
        summary.setCompletedCount(completed);
        summary.setCancelledCount(cancelled);
        summary.setCriticalCount(critical);
        summary.setHighPriorityCount(high);
        summary.setAverageWaitMinutes(avgWait != null ? Math.round(avgWait * 10.0) / 10.0 : null);
        summary.setAverageTreatmentMinutes(avgTreatment != null ? Math.round(avgTreatment * 10.0) / 10.0 : null);
        summary.setMinWaitMinutes(minWait);
        summary.setMaxWaitMinutes(maxWait);
        summary.setSeverityCounts(severityCounts);
        summary.setStatusCounts(statusCounts);

        return summary;
    }

    @Transactional(readOnly = true)
    public WaitingTimeMetricsDto getWaitingTimeMetrics() {
        WaitingTimeMetricsDto metrics = new WaitingTimeMetricsDto();
        metrics.setCalculationDefinition(
                "Actual wait time is calculated as (treatmentStartTime - arrivalTime) in minutes for all patients " +
                "who have been admitted to treatment (IN_TREATMENT or COMPLETED). Patients still waiting without treatment " +
                "are excluded from historical averages to prevent premature skew."
        );

        Double avgWait = patientRepository.findAverageWaitTimeMinutes();
        Double avgTreatment = patientRepository.findAverageTreatmentDurationMinutes();
        Long minWait = patientRepository.findMinWaitTimeMinutes();
        Long maxWait = patientRepository.findMaxWaitTimeMinutes();

        metrics.setAverageWaitMinutes(avgWait != null ? Math.round(avgWait * 10.0) / 10.0 : null);
        metrics.setAverageTreatmentDurationMinutes(avgTreatment != null ? Math.round(avgTreatment * 10.0) / 10.0 : null);
        metrics.setMinWaitMinutes(minWait);
        metrics.setMaxWaitMinutes(maxWait);

        List<Patient> allPatients = patientRepository.findAll();
        List<Patient> eligiblePatients = allPatients.stream()
                .filter(p -> p.getActualWaitDurationMinutes() != null)
                .collect(Collectors.toList());

        metrics.setEligiblePatientCount(eligiblePatients.size());

        // Breakdown average wait by severity
        Map<String, Double> avgBySeverity = new LinkedHashMap<>();
        for (Severity s : Severity.values()) {
            OptionalDouble avg = eligiblePatients.stream()
                    .filter(p -> p.getSeverity() == s)
                    .mapToLong(Patient::getActualWaitDurationMinutes)
                    .average();
            avgBySeverity.put(s.name(), avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null);
        }
        metrics.setAverageWaitBySeverity(avgBySeverity);

        // Hourly trends over the last 12 hours
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter hourFmt = DateTimeFormatter.ofPattern("HH:00");
        List<WaitingTimeMetricsDto.HourlyTrendDto> trends = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            LocalDateTime slotStart = now.minusHours(i).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime slotEnd = slotStart.plusHours(1);
            String slotLabel = slotStart.format(hourFmt);

            long arrivals = allPatients.stream()
                    .filter(p -> !p.getArrivalTime().isBefore(slotStart) && p.getArrivalTime().isBefore(slotEnd))
                    .count();

            long completions = allPatients.stream()
                    .filter(p -> p.getTreatmentEndTime() != null &&
                            !p.getTreatmentEndTime().isBefore(slotStart) &&
                            p.getTreatmentEndTime().isBefore(slotEnd))
                    .count();

            trends.add(new WaitingTimeMetricsDto.HourlyTrendDto(slotLabel, arrivals, completions));
        }
        metrics.setHourlyVolumeTrends(trends);

        return metrics;
    }

    @Transactional(readOnly = true)
    public List<SeverityDistributionDto> getSeverityDistribution() {
        long totalWaiting = patientRepository.countByStatus(PatientStatus.WAITING);
        List<SeverityDistributionDto> list = new ArrayList<>();

        for (Severity severity : Severity.values()) {
            long count = patientRepository.countBySeverityAndStatus(severity, PatientStatus.WAITING);
            double percentage = totalWaiting > 0 ? Math.round(((double) count / totalWaiting) * 1000.0) / 10.0 : 0.0;
            list.add(new SeverityDistributionDto(severity, count, percentage));
        }

        return list;
    }
}
