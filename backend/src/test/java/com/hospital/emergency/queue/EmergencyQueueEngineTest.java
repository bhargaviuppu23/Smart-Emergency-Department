package com.hospital.emergency.queue;

import com.hospital.emergency.model.Severity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class EmergencyQueueEngineTest {

    private EmergencyQueueEngine engine;

    @BeforeEach
    void setUp() {
        engine = new EmergencyQueueEngine();
    }

    @Test
    @DisplayName("PriorityQueue should order CRITICAL before HIGH before MEDIUM before LOW")
    void testSeverityPriorityOrdering() {
        LocalDateTime now = LocalDateTime.now();

        PatientQueueEntry low = new PatientQueueEntry(1L, "ED-001", "Low Patient", 25, Severity.LOW, now, 1L, "Minor cut", false);
        PatientQueueEntry med = new PatientQueueEntry(2L, "ED-002", "Med Patient", 30, Severity.MEDIUM, now, 2L, "Fever", false);
        PatientQueueEntry high = new PatientQueueEntry(3L, "ED-003", "High Patient", 45, Severity.HIGH, now, 3L, "Fracture", false);
        PatientQueueEntry crit = new PatientQueueEntry(4L, "ED-004", "Critical Patient", 60, Severity.CRITICAL, now, 4L, "Chest pain", false);

        // Enqueue in reverse order
        engine.enqueue(low);
        engine.enqueue(med);
        engine.enqueue(high);
        engine.enqueue(crit);

        assertThat(engine.size()).isEqualTo(4);

        // First out must be CRITICAL
        Optional<PatientQueueEntry> first = engine.pollNext();
        assertThat(first).isPresent();
        assertThat(first.get().getSeverity()).isEqualTo(Severity.CRITICAL);
        assertThat(first.get().getPatientId()).isEqualTo(4L);

        // Second out must be HIGH
        Optional<PatientQueueEntry> second = engine.pollNext();
        assertThat(second).isPresent();
        assertThat(second.get().getSeverity()).isEqualTo(Severity.HIGH);

        // Third out must be MEDIUM
        Optional<PatientQueueEntry> third = engine.pollNext();
        assertThat(third).isPresent();
        assertThat(third.get().getSeverity()).isEqualTo(Severity.MEDIUM);

        // Fourth out must be LOW
        Optional<PatientQueueEntry> fourth = engine.pollNext();
        assertThat(fourth).isPresent();
        assertThat(fourth.get().getSeverity()).isEqualTo(Severity.LOW);

        assertThat(engine.size()).isZero();
    }

    @Test
    @DisplayName("Patients with equal severity must strictly follow FIFO arrival order")
    void testEqualSeverityFifoOrder() {
        LocalDateTime base = LocalDateTime.now();

        // Two patients with same severity HIGH, arriving at different times and sequence numbers
        PatientQueueEntry highFirst = new PatientQueueEntry(
                10L, "ED-010", "First High", 35, Severity.HIGH, base.minusMinutes(15), 10L, "Severe asthma", false);

        PatientQueueEntry highSecond = new PatientQueueEntry(
                11L, "ED-011", "Second High", 40, Severity.HIGH, base.minusMinutes(5), 11L, "Compound fracture", false);

        engine.enqueue(highSecond); // Enqueued second arrival first
        engine.enqueue(highFirst);  // Enqueued earlier arrival second

        List<PatientQueueEntry> snapshot = engine.getOrderedSnapshot();
        assertThat(snapshot).hasSize(2);
        assertThat(snapshot.get(0).getPatientId()).isEqualTo(10L); // Earlier arrival must be #1
        assertThat(snapshot.get(1).getPatientId()).isEqualTo(11L); // Later arrival must be #2
    }

    @Test
    @DisplayName("Arriving CRITICAL patient preempts existing waiting patients at the head of queue")
    void testPreemptionByCriticalArrival() {
        LocalDateTime now = LocalDateTime.now();

        PatientQueueEntry med = new PatientQueueEntry(1L, "ED-001", "Med Patient", 30, Severity.MEDIUM, now.minusMinutes(20), 1L, "Abdominal pain", false);
        PatientQueueEntry high = new PatientQueueEntry(2L, "ED-002", "High Patient", 45, Severity.HIGH, now.minusMinutes(10), 2L, "Deep laceration", false);

        engine.enqueue(med);
        engine.enqueue(high);

        // Before critical arrives, HIGH is at the top
        assertThat(engine.peekNext().get().getSeverity()).isEqualTo(Severity.HIGH);

        // Suddenly, a CRITICAL patient arrives
        PatientQueueEntry critical = new PatientQueueEntry(3L, "ED-003", "Cardiac Arrest", 65, Severity.CRITICAL, now, 3L, "Unresponsive", false);
        engine.enqueue(critical);

        // Now CRITICAL must immediately be at the top
        assertThat(engine.peekNext().get().getSeverity()).isEqualTo(Severity.CRITICAL);
        assertThat(engine.peekNext().get().getPatientId()).isEqualTo(3L);
    }

    @Test
    @DisplayName("HashMap lookup provides fast O(1) patient retrieval and reflects queue presence")
    void testHashMapLookup() {
        LocalDateTime now = LocalDateTime.now();
        PatientQueueEntry entry = new PatientQueueEntry(55L, "ED-055", "Jane Doe", 28, Severity.HIGH, now, 55L, "Headache", false);

        engine.enqueue(entry);

        assertThat(engine.contains(55L)).isTrue();
        assertThat(engine.findById(55L)).isPresent();
        assertThat(engine.findById(55L).get().getFullName()).isEqualTo("Jane Doe");

        // After removal, lookup should return empty
        engine.remove(55L);
        assertThat(engine.contains(55L)).isFalse();
        assertThat(engine.findById(55L)).isEmpty();
    }

    @Test
    @DisplayName("Re-triaging updates patient severity and adjusts queue rank correctly")
    void testRetriageDynamicReordering() {
        LocalDateTime now = LocalDateTime.now();
        PatientQueueEntry p1 = new PatientQueueEntry(1L, "ED-001", "Patient 1", 30, Severity.MEDIUM, now.minusMinutes(10), 1L, "Mild dizziness", false);
        PatientQueueEntry p2 = new PatientQueueEntry(2L, "ED-002", "Patient 2", 40, Severity.HIGH, now.minusMinutes(5), 2L, "Fracture", false);

        engine.enqueue(p1);
        engine.enqueue(p2);

        // Initially Patient 2 (HIGH) is ahead of Patient 1 (MEDIUM)
        assertThat(engine.peekNext().get().getPatientId()).isEqualTo(2L);

        // Re-triage Patient 1 from MEDIUM to CRITICAL
        boolean updated = engine.updateSeverity(1L, Severity.CRITICAL);
        assertThat(updated).isTrue();

        // Now Patient 1 must be ahead of Patient 2
        assertThat(engine.peekNext().get().getPatientId()).isEqualTo(1L);
        assertThat(engine.peekNext().get().getSeverity()).isEqualTo(Severity.CRITICAL);
    }

    @Test
    @DisplayName("Concurrent queue operations remain safe and non-corrupted")
    void testConcurrentOperations() throws InterruptedException {
        int threadCount = 8;
        int operationsPerThread = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        LocalDateTime base = LocalDateTime.now();

        for (int t = 0; t < threadCount; t++) {
            final int threadId = t;
            executor.submit(() -> {
                try {
                    for (int i = 0; i < operationsPerThread; i++) {
                        long id = (long) (threadId * 1000 + i);
                        Severity s = Severity.values()[i % 4];
                        PatientQueueEntry entry = new PatientQueueEntry(
                                id, "ED-" + id, "Patient " + id, 30, s, base.plusSeconds(i), id, "Complaint", false
                        );
                        engine.enqueue(entry);
                        if (i % 5 == 0) {
                            engine.peekNext();
                        }
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean completed = latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();
        assertThat(engine.size()).isEqualTo(threadCount * operationsPerThread);

        List<PatientQueueEntry> snapshot = engine.getOrderedSnapshot();
        assertThat(snapshot).hasSize(threadCount * operationsPerThread);

        // Verify ordering consistency across whole snapshot
        for (int i = 0; i < snapshot.size() - 1; i++) {
            PatientQueueEntry curr = snapshot.get(i);
            PatientQueueEntry next = snapshot.get(i + 1);
            assertThat(curr.getSeverity().getPriorityRank()).isLessThanOrEqualTo(next.getSeverity().getPriorityRank());
        }
    }
}
