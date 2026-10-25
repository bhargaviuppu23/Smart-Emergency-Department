import React, { useState } from 'react';
import { api } from '../api/client';
import { ConfirmModal } from '../components/ConfirmModal';
import { NavTab } from '../components/Navbar';
import {
  FlaskConical,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ListOrdered,
  Layers,
} from 'lucide-react';

interface SimulationPageProps {
  onSimulationUpdated: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  onSimulationUpdated,
  onNavigate,
}) => {
  const [patientCount, setPatientCount] = useState(8);
  const [clearExisting, setClearExisting] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleGenerate = async () => {
    try {
      setLoadingGenerate(true);
      setMessage(null);
      const created = await api.generateDemo(patientCount, clearExisting);
      setMessage({
        text: `Successfully generated ${created.length} simulation patients with varied triage severities and staggered arrival timestamps.`,
        type: 'success',
      });
      onSimulationUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to generate demo patients.', type: 'error' });
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingReset(true);
      setMessage(null);
      await api.resetDemo();
      setMessage({
        text: 'All simulation demo patients have been cleanly purged and the PriorityQueue was reconciled.',
        type: 'success',
      });
      setShowResetConfirm(false);
      onSimulationUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to reset demo dataset.', type: 'error' });
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Simulation & Data Structures Laboratory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate synthetic patient cohorts to inspect priority preemption and FIFO tie-breaking in real time.
          </p>
        </div>

        <button
          onClick={() => onNavigate('live-queue')}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors self-start sm:self-auto shadow-xs"
        >
          Inspect Live Queue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </button>
      </div>

      {message && (
        <div
          className={`p-4 text-xs font-medium rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Generator Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
          Synthetic Patient Cohort Generator
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          All generated records are explicitly tagged with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700">isDemo = true</code> and use simulated clinical presentations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cohort Size (Patients)
            </label>
            <select
              value={patientCount}
              onChange={(e) => setPatientCount(parseInt(e.target.value))}
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-1 focus:border-sky-500"
            >
              <option value={4}>4 Patients (Quick Test)</option>
              <option value={6}>6 Patients (Mixed Severities)</option>
              <option value={8}>8 Patients (Full Triage Test Suite)</option>
            </select>
          </div>

          <div className="flex items-center sm:pt-6">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Purge existing demo data before creating</span>
            </label>
          </div>

          <div className="flex items-end justify-end space-x-3 sm:pt-6">
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={loadingReset}
              className="px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Demo
            </button>

            <button
              onClick={handleGenerate}
              disabled={loadingGenerate}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center"
            >
              {loadingGenerate ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              )}
              Generate Cohort
            </button>
          </div>
        </div>
      </div>

      {/* Algorithmic Scenarios Explained */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center">
          <ListOrdered className="w-4 h-4 mr-2 text-sky-600" />
          Key Algorithmic Verification Scenarios in this Demo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Scenario 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Priority Preemption (Level 1 CRITICAL Leapfrog)</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Notice that <strong>Simulation Subject: Foxtrot (CRITICAL)</strong> arrived only 15 minutes ago, while <strong>Bravo (HIGH)</strong> arrived 40 minutes ago.
                The <code>PatientPriorityComparator</code> ensures Foxtrot jumps directly to position <strong>#1</strong> ahead of all lower-urgency patients regardless of their wait time.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
              Rule: PriorityRank(CRITICAL=1) &lt; PriorityRank(HIGH=2)
            </div>
          </div>

          {/* Scenario 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>FIFO Tie-Breaking for Identical Severities</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Both <strong>Bravo</strong> and <strong>Charlie</strong> have identical <strong>HIGH (Level 2)</strong> urgency.
                Because Bravo arrived 40 mins ago and Charlie arrived 35 mins ago, the engine preserves chronological arrival order. Bravo is deterministic #1 in that tier and Charlie is #2.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
              Rule: If (rank1 == rank2) compare arrivalTime & sequence
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Isolation Assurance */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-600 text-xs flex items-center space-x-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <span>
          <strong>Data Isolation Assurance:</strong> Demo data is strictly partitioned using the database field <code className="font-mono text-slate-800">is_demo = true</code>. Clicking "Reset Demo" purges solely synthetic records and leaves any manual registrations intact.
        </span>
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Simulation Demo Records?"
        message="This will delete all demo patients and reconcile the in-memory Java PriorityQueue. Manually registered non-demo patient records will be preserved."
        confirmLabel="Purge Demo Data"
        cancelLabel="Keep Demo Data"
        isDestructive={true}
        isLoading={loadingReset}
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
