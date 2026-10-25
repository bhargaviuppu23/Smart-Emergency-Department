package com.hospital.emergency.queue;

import java.util.Comparator;

/**
 * Comparator implementing the multi-factor triage priority rules:
 *
 * 1. Primary Criterion: Medical Severity (ESI triage rank)
 *    - CRITICAL (Rank 1) > HIGH (Rank 2) > MEDIUM (Rank 3) > LOW (Rank 4)
 *
 * 2. Secondary Criterion: Chronological arrival time (FIFO)
 *    - Earlier arrival timestamps take precedence when severity ranks are identical.
 *
 * 3. Tie-breaker: Monotonic arrival sequence number
 *    - Guarantees deterministic total ordering even if system clocks resolve to identical milliseconds.
 *
 * Time Complexity: O(1) comparison operations.
 */
public class PatientPriorityComparator implements Comparator<PatientQueueEntry> {

    @Override
    public int compare(PatientQueueEntry p1, PatientQueueEntry p2) {
        if (p1 == p2) {
            return 0;
        }
        if (p1 == null) {
            return 1;
        }
        if (p2 == null) {
            return -1;
        }

        // 1. Primary: Severity rank (Ascending: 1 is highest priority, 4 is lowest)
        int severityComparison = Integer.compare(
                p1.getSeverity().getPriorityRank(),
                p2.getSeverity().getPriorityRank()
        );
        if (severityComparison != 0) {
            return severityComparison;
        }

        // 2. Secondary: Chronological arrival time (FIFO)
        int arrivalComparison = p1.getArrivalTime().compareTo(p2.getArrivalTime());
        if (arrivalComparison != 0) {
            return arrivalComparison;
        }

        // 3. Tie-Breaker: Monotonic arrival sequence number for deterministic ordering
        return Long.compare(p1.getArrivalSequenceNumber(), p2.getArrivalSequenceNumber());
    }
}
