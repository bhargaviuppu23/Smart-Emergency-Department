import React, { useEffect, useState } from 'react';
import { QueueItem, Patient, Severity } from '../types';
import { api } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { RetriageModal } from '../components/RetriageModal';
import {
  Play,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface LiveQueuePageProps {
  onQueueUpdated: () => void;
}

export const LiveQueuePage: React.FC<LiveQueuePageProps> = ({ onQueueUpdated }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [inTreatmentPatient, setInTreatmentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [selectedPatientForRetriage, setSelectedPatientForRetriage] = useState<Patient | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<{ id: number; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // FIFO sub-queue inspector
  const [inspectSeverity, setInspectSeverity] = useState<Severity>('HIGH');
  const [fifoBucket, setFifoBucket] = useState<any[]>([]);
  const [loadingFifo, setLoadingFifo] = useState(false);

  const fetchQueueData = async () => {
    try {
      setRefreshing(true);
      const [queueData, treatmentRes] = await Promise.all([
        api.getLiveQueue(),
        api.getPatients({ status: 'IN_TREATMENT', size: 1 }),
      ]);
      setQueue(queueData);
      setInTreatmentPatient(treatmentRes.content.length > 0 ? treatmentRes.content[0] : null);
    } catch (err: any) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFifoBucket = async (sev: Severity) => {
    try {
      setLoadingFifo(true);
      const data = await api.getFifoQueue(sev);
      setFifoBucket(data);
    } catch (err) {
      console.error('Error fetching FIFO sub-queue:', err);
    } finally {
      setLoadingFifo(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFifoBucket(inspectSeverity);
  }, [inspectSeverity, queue]);

  const handleStartTreatment = async (patientId: number) => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      const res = await api.startTreatment(patientId);
      setActionMessage({
        text: `Treatment successfully initiated for ${res.fullName}. Wait time recorded: ${res.actualWaitDurationMinutes} mins.`,
        type: 'success',
      });
      await fetchQueueData();
      onQueueUpdated();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to start treatment.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTreatment = async (patientId: number) => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      const res = await api.completeTreatment(patientId, 'Treatment concluded successfully.');
      setActionMessage({
        text: `Patient ${res.fullName} completed treatment and discharged. Recorded duration: ${res.treatmentDurationMinutes} mins.`,
        type: 'success',
      });
      await fetchQueueData();
      onQueueUpdated();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to complete treatment.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    try {
      setActionLoading(true);
      setActionMessage(null);
      await api.cancelPatient(cancelModalItem.id, 'Cancelled via queue management.');
      setActionMessage({
        text: `Patient ${cancelModalItem.name} was removed from the active queue.`,
        type: 'success',
      });
      setCancelModalItem(null);
      await fetchQueueData();
      onQueueUpdated();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to cancel patient.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openPatientDetails = async (id: number) => {
    try {
      const p = await api.getPatientById(id);
      setSelectedPatientForDetail(p);
    } catch (err: any) {
      alert(err.message || 'Error fetching patient details.');
    }
  };

  const openRetriage = async (id: number) => {
    try {
      const p = await api.getPatientById(id);
      setSelectedPatientForRetriage(p);
    } catch (err: any) {
      alert(err.message || 'Error fetching patient.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Live Emergency Department Queue
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {queue.length} Waiting
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Min-Heap Priority Ordering (CRITICAL → HIGH → MEDIUM → LOW), tie-broken chronologically by arrival FIFO sequence.
          </p>
        </div>

        <button
          onClick={fetchQueueData}
          disabled={refreshing}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh Queue'}
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-3 text-xs font-medium rounded-xl flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="font-bold ml-2 hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Treatment Resource Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-600 animate-spin" />
            <h3 className="text-sm font-bold text-slate-900">
              Active Treatment Bay (Capacity: 1 Resource)
            </h3>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              inTreatmentPatient
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {inTreatmentPatient ? 'Bay Occupied' : 'Bay Vacant'}
          </span>
        </div>

        {inTreatmentPatient ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {inTreatmentPatient.patientIdentifier}
                </span>
                <SeverityBadge severity={inTreatmentPatient.severity} />
                <span className="text-xs text-slate-500">
                  Started at:{' '}
                  {inTreatmentPatient.treatmentStartTime
                    ? new Date(inTreatmentPatient.treatmentStartTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {inTreatmentPatient.fullName} (Age: {inTreatmentPatient.age} yrs)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Chief Complaint: {inTreatmentPatient.presentingComplaint}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => openPatientDetails(inTreatmentPatient.id)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                View Chart
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleCompleteTreatment(inTreatmentPatient.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Complete Treatment & Discharge
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <span>No patient currently occupying the treatment bay.</span>
            {queue.length > 0 && (
              <button
                onClick={() => handleStartTreatment(queue[0].patientId)}
                className="ml-2 font-semibold text-sky-600 hover:text-sky-800 underline"
              >
                Admit #1 ({queue[0].fullName}) now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Live Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Deterministic Priority Order ({queue.length} Active Patients)
            </h3>
            <p className="text-xs text-slate-500">
              Sorted via custom PatientPriorityComparator. Iteration order is never relied on.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading active queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No patients currently waiting in the emergency queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rank / Position</th>
                  <th className="py-3 px-4">Patient Code</th>
                  <th className="py-3 px-4">Name & Demographics</th>
                  <th className="py-3 px-4">Triage Urgency</th>
                  <th className="py-3 px-4">Arrival Time</th>
                  <th className="py-3 px-4">Waiting Duration</th>
                  <th className="py-3 px-4">Presenting Complaint</th>
                  <th className="py-3 px-4 text-right">Queue Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item) => {
                  const isTop = item.queuePosition === 1;
                  const canAdmit = !inTreatmentPatient;

                  return (
                    <tr
                      key={item.patientId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop ? 'bg-sky-50/20 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                            isTop
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{item.queuePosition}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-600">
                        {item.patientIdentifier}
                        {item.demo && (
                          <span className="block text-[9px] text-amber-600 uppercase font-sans">
                            SIM DEMO
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.fullName}</div>
                        <div className="text-[11px] text-slate-400">
                          Age: {item.age} yrs • Seq #{item.arrivalSequenceNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <SeverityBadge severity={item.severity} />
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(item.arrivalTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold ${
                            item.currentWaitMinutes > 40
                              ? 'text-red-600 font-bold'
                              : item.currentWaitMinutes > 20
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1 opacity-70" />
                          {item.currentWaitMinutes} mins
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {item.presentingComplaint}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="Start Treatment"
                            disabled={actionLoading || !canAdmit}
                            onClick={() => handleStartTreatment(item.patientId)}
                            className={`p-1.5 rounded-lg text-white transition-colors ${
                              canAdmit
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-2xs'
                                : 'bg-slate-300 cursor-not-allowed text-slate-500'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            title="Re-Triage Severity"
                            onClick={() => openRetriage(item.patientId)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="View Record"
                            onClick={() => openPatientDetails(item.patientId)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Cancel Entry"
                            onClick={() =>
                              setCancelModalItem({ id: item.patientId, name: item.fullName })
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Internal FIFO Deque Sub-Queue Inspector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Internal Same-Priority FIFO Queue Inspector
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrates the dedicated Java ArrayDeque sub-queue maintaining strict FIFO order within the same severity rank.
            </p>
          </div>

          {/* Severity selector tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Severity[]).map((s) => (
              <button
                key={s}
                onClick={() => setInspectSeverity(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  inspectSeverity === s
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loadingFifo ? (
          <div className="py-4 text-center text-xs text-slate-400">Reading FIFO Deque...</div>
        ) : fifoBucket.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No waiting patients currently in the {inspectSeverity} FIFO bucket.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {fifoBucket.map((entry, idx) => (
              <div
                key={entry.patientId}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-sky-700">FIFO #{idx + 1} in Tier</span>
                    <span className="font-mono">{entry.patientIdentifier}</span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs mt-1">{entry.fullName}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {entry.presentingComplaint}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-200/60 pt-1.5 flex justify-between">
                  <span>Seq #{entry.arrivalSequenceNumber}</span>
                  <span>
                    Arr:{' '}
                    {new Date(entry.arrivalTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={!!cancelModalItem}
        title="Cancel Patient Entry?"
        message={`Are you sure you want to cancel the queue registration for ${cancelModalItem?.name}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Entry"
        cancelLabel="Keep in Queue"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalItem(null)}
      />

      <PatientDetailModal
        patient={selectedPatientForDetail}
        onClose={() => setSelectedPatientForDetail(null)}
        onRetriage={(p) => openRetriage(p.id)}
      />

      <RetriageModal
        patient={selectedPatientForRetriage}
        isOpen={!!selectedPatientForRetriage}
        onClose={() => setSelectedPatientForRetriage(null)}
        onSuccess={() => {
          fetchQueueData();
          onQueueUpdated();
        }}
      />
    </div>
  );
};
