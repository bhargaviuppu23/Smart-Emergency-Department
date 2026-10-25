import React from 'react';
import {
  Layers,
  Cpu,
  Database,
  Lock,
  RefreshCw,
  GitBranch,
  CheckCircle2,
  Table,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const complexityData = [
    {
      operation: 'Patient Enqueue (Arrival)',
      dataStructure: 'PriorityQueue<PatientQueueEntry>',
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(N)',
      explanation: 'Binary min-heap bubble-up based on PriorityRank and monotonic sequence.',
    },
    {
      operation: 'Peek Next Eligible Patient',
      dataStructure: 'PriorityQueue.peek()',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      explanation: 'Direct root node inspection of the highest-urgency waiting patient.',
    },
    {
      operation: 'Poll Next Patient (Admit)',
      dataStructure: 'PriorityQueue.poll()',
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
      explanation: 'Extracts root node, moves last element to root and sifts down.',
    },
    {
      operation: 'Patient Lookup by Database ID',
      dataStructure: 'HashMap<Long, PatientQueueEntry>',
      timeComplexity: 'O(1) average',
      spaceComplexity: 'O(N)',
      explanation: 'Hash-bucket indexing for instantaneous existence and detail retrieval.',
    },
    {
      operation: 'Same-Priority FIFO Deque',
      dataStructure: 'ArrayDeque<PatientQueueEntry>',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(K)',
      explanation: 'Pure FIFO queue maintained per individual Severity band.',
    },
    {
      operation: 'Ordered UI Snapshot View',
      dataStructure: 'ArrayList + Collections.sort()',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      explanation: 'Creates a deterministic snapshot; avoids relying on PriorityQueue iteration order.',
    },
    {
      operation: 'Dynamic Re-Triage Reorder',
      dataStructure: 'remove() + enqueue()',
      timeComplexity: 'O(N) remove + O(log N) insert',
      spaceComplexity: 'O(1)',
      explanation: 'Removes old severity entry and re-inserts into min-heap with updated rank.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-sky-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Architecture & Data Structures Analysis
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed breakdown of object-oriented design, algorithmic complexities, and hybrid memory-database synchronization.
        </p>
      </div>

      {/* Core Data Structures Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PriorityQueue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm mb-2">
            <Layers className="w-4 h-4" />
            <h3>1. Java PriorityQueue (Min-Heap)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The core scheduling engine utilizes Java's <code>PriorityQueue</code> governed by a custom{' '}
            <code>PatientPriorityComparator</code>. Rather than traditional FIFO alone, patients are ordered by medical acuity (Level 1 CRITICAL down to Level 4 LOW).
          </p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 border border-slate-100">
            Primary: compare(severityRank1, severityRank2)<br />
            Secondary: compare(arrivalTime1, arrivalTime2)<br />
            Tie-Breaker: compare(monotonicSeq1, monotonicSeq2)
          </div>
        </div>

        {/* HashMap Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-teal-700 font-bold text-sm mb-2">
            <Database className="w-4 h-4" />
            <h3>2. Java HashMap (O(1) Lookups)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            While PriorityQueue provides fast <code>O(1)</code> peek of the root, searching for an arbitrary patient by their database ID in a raw heap requires an <code>O(N)</code> traversal.
            A companion <code>HashMap&lt;Long, PatientQueueEntry&gt;</code> maintains <code>O(1)</code> average-time patient status verification and lookup.
          </p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 border border-slate-100">
            Map&lt;Long, PatientQueueEntry&gt; patientLookup<br />
            contains(id) → O(1)<br />
            findById(id) → O(1)
          </div>
        </div>

        {/* ArrayDeque FIFO Buckets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-2">
            <GitBranch className="w-4 h-4" />
            <h3>3. ArrayDeque (Same-Priority FIFO Queues)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Demonstrates pure FIFO behavior within identical severity categories. Each severity level possesses a dedicated <code>ArrayDeque</code> demonstrating the classic queue property:{' '}
            <em>First In, First Out</em>.
          </p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 border border-slate-100">
            EnumMap&lt;Severity, Deque&lt;PatientQueueEntry&gt;&gt;<br />
            offerLast(entry) → O(1)<br />
            peekFirst() → O(1)
          </div>
        </div>

        {/* ArrayList & Concurrency Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm mb-2">
            <Lock className="w-4 h-4" />
            <h3>4. ArrayList Snapshots & Concurrency</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Java's <code>PriorityQueue.iterator()</code> <strong>does not</strong> guarantee sorted order traversal. To render a live dashboard accurately, snapshots are extracted to an <code>ArrayList</code> and sorted. Thread safety is enforced with a <code>ReentrantReadWriteLock</code>.
          </p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-700 border border-slate-100">
            ReentrantReadWriteLock lock<br />
            Multiple concurrent readers, serialized writes<br />
            Zero race conditions under load
          </div>
        </div>
      </div>

      {/* Algorithmic Complexity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Table className="w-4 h-4 mr-2 text-sky-600" />
            Algorithmic Time & Space Complexity Summary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Theoretical guarantees verified by automated concurrency and stress tests.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Underlying Data Structure</th>
                <th className="py-3 px-4">Time Complexity</th>
                <th className="py-3 px-4">Space Complexity</th>
                <th className="py-3 px-4">Algorithmic Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complexityData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.operation}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{row.dataStructure}</td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-700">{row.timeComplexity}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.spaceComplexity}</td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">{row.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Reconciliation Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 text-indigo-600" />
          Durable Persistence & Startup Queue Reconciliation
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          In enterprise software, in-memory structures must never be a single point of failure. The PostgreSQL/H2 database acts as the durable single source of truth:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-900 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 1. On Patient Arrival
            </div>
            <p className="mt-1 text-slate-500 text-[11px]">
              Persisted to PostgreSQL table <code>patients</code>, assigned monotonic sequence, then enqueued in PriorityQueue.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-900 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 2. Server Crash / Restart
            </div>
            <p className="mt-1 text-slate-500 text-[11px]">
              Spring Boot triggers <code>@EventListener(ApplicationReadyEvent.class)</code> to query all active <code>WAITING</code> records.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-900 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 3. Queue Rebuild
            </div>
            <p className="mt-1 text-slate-500 text-[11px]">
              In-memory PriorityQueue and HashMaps are safely repopulated in <code>O(N log N)</code> without data loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
