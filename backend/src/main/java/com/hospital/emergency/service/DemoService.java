package com.hospital.emergency.service;

import com.hospital.emergency.dto.DemoGenerateDto;
import com.hospital.emergency.model.Patient;
import com.hospital.emergency.model.PatientStatus;
import com.hospital.emergency.model.Severity;
import com.hospital.emergency.queue.EmergencyQueueEngine;
import com.hospital.emergency.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DemoService {

    private static final Logger log = LoggerFactory.getLogger(DemoService.class);

    private final PatientRepository patientRepository;
    private final EmergencyQueueEngine queueEngine;
    private final QueueService queueService;
    private final EventService eventService;

    // Fictional clinical demo presets explicitly labeled for simulation
    private record DemoTemplate(String name, int age, String gender, Severity severity, String complaint, String notes, int arrivalOffsetMinutes) {}

    private static final List<DemoTemplate> TEMPLATES = List.of(
            new DemoTemplate("Simulation Subject: Alpha", 58, "Male", Severity.CRITICAL,
                    "Acute substernal chest pain radiating to jaw with diaphoresis",
                    "Immediate EKG indicated. Suspected STEMI. Priority 1.", 45),

            new DemoTemplate("Simulation Subject: Bravo", 34, "Female", Severity.HIGH,
                    "Compound tibia fracture with skin breakthrough and moderate bleeding",
                    "Immobilized limb. IV analgesia indicated. Priority 2.", 40),

            new DemoTemplate("Simulation Subject: Charlie", 29, "Non-Binary", Severity.HIGH,
                    "Severe acute asthma exacerbation with audible wheezing and tachypnea",
                    "SpO2 91% on room air. Nebulizer therapy required. Priority 2 (Arrived after Bravo to test FIFO tie-breaker).", 35),

            new DemoTemplate("Simulation Subject: Delta", 67, "Female", Severity.MEDIUM,
                    "Persistent high-grade fever (39.2 C) with chills and cough",
                    "Stable vitals, mild dehydration. Priority 3.", 30),

            new DemoTemplate("Simulation Subject: Echo", 22, "Male", Severity.LOW,
                    "Minor superficial forearm laceration from kitchen knife",
                    "Bleeding controlled. Suture evaluation. Priority 4.", 25),

            new DemoTemplate("Simulation Subject: Foxtrot", 45, "Male", Severity.CRITICAL,
                    "Sudden onset unilateral facial droop and right arm hemiparesis",
                    "Code Stroke activation. Immediate CT head required. Priority 1.", 15),

            new DemoTemplate("Simulation Subject: Golf", 51, "Female", Severity.MEDIUM,
                    "Suspected uncomplicated urinary tract infection with dysuria",
                    "Vitals stable, urinalysis ordered. Priority 3.", 10),

            new DemoTemplate("Simulation Subject: Hotel", 19, "Male", Severity.LOW,
                    "Inversion ankle injury with mild localized swelling",
                    "Weight-bearing with mild discomfort. X-ray ordered. Priority 4.", 5)
    );

    public DemoService(PatientRepository patientRepository,
                       EmergencyQueueEngine queueEngine,
                       QueueService queueService,
                       EventService eventService) {
        this.patientRepository = patientRepository;
        this.queueEngine = queueEngine;
        this.queueService = queueService;
        this.eventService = eventService;
    }

    @Transactional
    public List<Patient> generateDemoPatients(DemoGenerateDto request) {
        if (request.isClearExisting()) {
            resetDemoPatients();
        }

        int count = Math.min(request.getCount(), TEMPLATES.size());
        List<Patient> created = new ArrayList<>();
        LocalDateTime baseTime = LocalDateTime.now();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        for (int i = 0; i < count; i++) {
            DemoTemplate t = TEMPLATES.get(i);
            long seq = queueEngine.nextSequenceNumber();
            String identifier = String.format("SIM-%s-%04d", datePrefix, seq % 10000);
            LocalDateTime arrival = baseTime.minusMinutes(t.arrivalOffsetMinutes());

            Patient patient = new Patient(
                    identifier,
                    t.name(),
                    t.age(),
                    t.gender(),
                    t.complaint(),
                    t.severity(),
                    PatientStatus.WAITING,
                    t.notes(),
                    arrival,
                    seq,
                    true // isDemo flag
            );

            Patient saved = patientRepository.save(patient);
            queueService.enqueuePatient(saved);
            created.add(saved);

            eventService.recordEvent(
                    saved.getId(),
                    saved.getPatientIdentifier(),
                    "DEMO_PATIENT_CREATED",
                    String.format("Generated simulated patient %s (%s, Seq #%d).",
                            saved.getFullName(), saved.getSeverity(), seq)
            );
        }

        log.info("Generated {} demo simulation patients.", created.size());
        return created;
    }

    @Transactional
    public void resetDemoPatients() {
        log.info("Resetting all simulation demo patients...");
        List<Patient> demoPatients = patientRepository.findByIsDemoTrue();

        for (Patient p : demoPatients) {
            queueEngine.remove(p.getId());
        }

        patientRepository.deleteByIsDemoTrue();

        eventService.recordEvent(
                null,
                "SYSTEM",
                "DEMO_DATA_RESET",
                String.format("Cleared %d demo simulation patients and reconciled queue engine.", demoPatients.size())
        );

        // Reconstruct remaining real patients
        queueService.reconstructQueueOnStartup();
    }
}
