package com.hospital.emergency.queue;

import com.hospital.emergency.model.Severity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * High-performance, concurrency-safe in-memory Emergency Department Queue Engine.
 *
 * Utilizes core Java Data Structures:
 * 1. PriorityQueue: Min-heap scheduled by PatientPriorityComparator.
 *    - Insertion: O(log N)
 *    - Peek Next: O(1)
 *    - Poll Next: O(log N)
 * 2. HashMap: O(1) average lookup of queue entries by patient database ID.
 * 3. ArrayDeque (Queue): O(1) FIFO sub-queues grouped by Severity category,
 *    demonstrating strict same-priority FIFO queuing.
 * 4. ArrayList: O(N log N) deterministic ordered snapshot derivation for UI displays.
 *
 * Concurrency: Thread safety enforced via ReentrantReadWriteLock to permit
 * concurrent read snapshots while serializing queue mutations.
 */
@Component
public class EmergencyQueueEngine {

    private static final Logger log = LoggerFactory.getLogger(EmergencyQueueEngine.class);

    private final PatientPriorityComparator comparator = new PatientPriorityComparator();
    private final PriorityQueue<PatientQueueEntry> priorityQueue = new PriorityQueue<>(comparator);
    private final Map<Long, PatientQueueEntry> patientLookup = new HashMap<>();
    private final Map<Severity, Deque<PatientQueueEntry>> severityFifoBuckets = new EnumMap<>(Severity.class);

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private final AtomicLong sequenceGenerator = new AtomicLong(0);

    public EmergencyQueueEngine() {
        for (Severity severity : Severity.values()) {
            severityFifoBuckets.put(severity, new ArrayDeque<>());
        }
    }

    /**
     * Generates a monotonically increasing sequence number for deterministic FIFO tie-breaking.
     */
    public long nextSequenceNumber() {
        return sequenceGenerator.incrementAndGet();
    }

    /**
     * Updates sequence generator to remain higher than any existing record (e.g. after database load).
     */
    public void ensureSequenceNumberAtLeast(long value) {
        sequenceGenerator.updateAndGet(current -> Math.max(current, value));
    }

    /**
     * Enqueues an active patient into all relevant scheduling structures.
     * Complexity: O(log N) heap insert, O(1) map insert, O(1) deque insert.
     */
    public void enqueue(PatientQueueEntry entry) {
        lock.writeLock().lock();
        try {
            // Remove existing entry if already present to prevent duplicate state
            if (patientLookup.containsKey(entry.getPatientId())) {
                removeInternal(entry.getPatientId());
            }

            priorityQueue.offer(entry);
            patientLookup.put(entry.getPatientId(), entry);
            severityFifoBuckets.get(entry.getSeverity()).offerLast(entry);

            log.debug("Enqueued patient {} (Severity: {}, Sequence: {}). Total waiting: {}",
                    entry.getPatientIdentifier(), entry.getSeverity(), entry.getArrivalSequenceNumber(), priorityQueue.size());
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Retrieves but does not remove the highest-priority patient waiting in queue.
     * Complexity: O(1).
     */
    public Optional<PatientQueueEntry> peekNext() {
        lock.readLock().lock();
        try {
            return Optional.ofNullable(priorityQueue.peek());
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Removes and returns the highest-priority patient waiting in queue.
     * Complexity: O(log N) heap poll, O(1) map remove, O(K) deque remove.
     */
    public Optional<PatientQueueEntry> pollNext() {
        lock.writeLock().lock();
        try {
            PatientQueueEntry top = priorityQueue.poll();
            if (top != null) {
                patientLookup.remove(top.getPatientId());
                severityFifoBuckets.get(top.getSeverity()).remove(top);
                log.info("Polled next patient {} from queue. Remaining: {}", top.getPatientIdentifier(), priorityQueue.size());
            }
            return Optional.ofNullable(top);
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Removes a specific patient by ID from the active queue (e.g. on cancellation or manual status change).
     * Complexity: O(N) heap removal, O(1) map remove.
     */
    public boolean remove(Long patientId) {
        lock.writeLock().lock();
        try {
            return removeInternal(patientId);
        } finally {
            lock.writeLock().unlock();
        }
    }

    private boolean removeInternal(Long patientId) {
        PatientQueueEntry existing = patientLookup.remove(patientId);
        if (existing != null) {
            priorityQueue.remove(existing);
            severityFifoBuckets.get(existing.getSeverity()).remove(existing);
            return true;
        }
        return false;
    }

    /**
     * Re-triages a patient by updating severity and re-positioning in PriorityQueue.
     */
    public boolean updateSeverity(Long patientId, Severity newSeverity) {
        lock.writeLock().lock();
        try {
            PatientQueueEntry existing = patientLookup.get(patientId);
            if (existing == null) {
                return false;
            }
            // Remove from structures, update, and re-enqueue
            priorityQueue.remove(existing);
            severityFifoBuckets.get(existing.getSeverity()).remove(existing);

            existing.setSeverity(newSeverity);

            priorityQueue.offer(existing);
            severityFifoBuckets.get(newSeverity).offerLast(existing);
            return true;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Fast O(1) lookup of an in-queue patient by database ID.
     */
    public Optional<PatientQueueEntry> findById(Long patientId) {
        lock.readLock().lock();
        try {
            return Optional.ofNullable(patientLookup.get(patientId));
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Determines whether a patient is currently registered in the active queue.
     */
    public boolean contains(Long patientId) {
        lock.readLock().lock();
        try {
            return patientLookup.containsKey(patientId);
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Returns a deterministically sorted ArrayList snapshot of active patients in priority order.
     * Note: PriorityQueue iterator DOES NOT guarantee traversal in sorted order!
     * We copy to an ArrayList and sort using our PatientPriorityComparator.
     * Complexity: O(N log N).
     */
    public List<PatientQueueEntry> getOrderedSnapshot() {
        lock.readLock().lock();
        try {
            List<PatientQueueEntry> snapshot = new ArrayList<>(patientLookup.values());
            snapshot.sort(comparator);
            return Collections.unmodifiableList(snapshot);
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Returns an unmodifiable snapshot of the FIFO Queue for a specific severity category.
     * Demonstrates FIFO handling within identical priority bands.
     */
    public List<PatientQueueEntry> getFifoQueueForSeverity(Severity severity) {
        lock.readLock().lock();
        try {
            Deque<PatientQueueEntry> bucket = severityFifoBuckets.get(severity);
            if (bucket == null) {
                return Collections.emptyList();
            }
            return Collections.unmodifiableList(new ArrayList<>(bucket));
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Returns current number of active waiting patients.
     * Complexity: O(1).
     */
    public int size() {
        lock.readLock().lock();
        try {
            return priorityQueue.size();
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Clears all in-memory queue state.
     */
    public void clear() {
        lock.writeLock().lock();
        try {
            priorityQueue.clear();
            patientLookup.clear();
            for (Deque<PatientQueueEntry> bucket : severityFifoBuckets.values()) {
                bucket.clear();
            }
            log.info("Emergency queue engine cleared.");
        } finally {
            lock.writeLock().unlock();
        }
    }
}
