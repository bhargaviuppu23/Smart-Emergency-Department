import React, { useEffect, useState } from 'react';
import { Patient, Severity, PatientStatus, PageResponse } from '../types';
import { api } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { RetriageModal } from '../components/RetriageModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Search,
  Filter,
  Eye,
  Sparkles,
  Play,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface PatientRecordsPageProps {
  onQueueUpdated: () => void;
}

export const PatientRecordsPage: React.FC<PatientRecordsPageProps> = ({ onQueueUpdated }) => {
  const [data, setData] = useState<PageResponse<Patient> | null>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | ''>('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [retriagePatient, setRetriagePatient] = useState<Patient | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<{ id: number; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getPatients({
        search: search.trim() || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
        page,
        size,
        sortBy: 'arrivalTime',
        sortDir: 'desc',
      });
      setData(res);
    } catch (err: any) {
      console.error('Error fetching patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, severityFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRecords();
  };

  const handleStartTreatment = async (id: number) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await api.startTreatment(id);
      setMessage({
        text: `Treatment started for ${res.fullName}. Wait time: ${res.actualWaitDurationMinutes}m.`,
        type: 'success',
      });
      await fetchRecords();
      onQueueUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to start treatment.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTreatment = async (id: number) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await api.completeTreatment(id, 'Completed treatment session.');
      setMessage({
        text: `Patient ${res.fullName} completed and discharged. Duration: ${res.treatmentDurationMinutes}m.`,
        type: 'success',
      });
      await fetchRecords();
      onQueueUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to complete treatment.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPatient = async () => {
    if (!cancelModalItem) return;
    try {
      setActionLoading(true);
      setMessage(null);
      await api.cancelPatient(cancelModalItem.id, 'Cancelled via records table.');
      setMessage({
        text: `Patient ${cancelModalItem.name} record marked as CANCELLED.`,
        type: 'success',
      });
      setCancelModalItem(null);
      await fetchRecords();
      onQueueUpdated();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to cancel patient.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Patient Encounter Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Searchable and filterable database records with lifecycle audit trail and status management.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`p-3 text-xs font-medium rounded-xl flex items-center justify-between border ${
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or identifier (e.g. ED-20261024-0001)..."
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value as Severity | '');
                setPage(0);
              }}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical (Level 1)</option>
              <option value="HIGH">High (Level 2)</option>
              <option value="MEDIUM">Medium (Level 3)</option>
              <option value="LOW">Low (Level 4)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as PatientStatus | '');
                setPage(0);
              }}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="WAITING">Waiting in Queue</option>
              <option value="IN_TREATMENT">In Treatment</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading patient records...</div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No patient records match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Arrival Time</th>
                  <th className="py-3 px-4">Wait Time</th>
                  <th className="py-3 px-4">Treatment Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.patientIdentifier}
                      {p.demo && (
                        <span className="block text-[9px] text-amber-600 font-sans font-semibold">
                          DEMO
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        Age: {p.age} • {p.gender || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={p.severity} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(p.arrivalTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      {p.actualWaitDurationMinutes !== null && p.actualWaitDurationMinutes !== undefined ? (
                        <span className="text-slate-800 font-bold">{p.actualWaitDurationMinutes} mins</span>
                      ) : p.status === 'WAITING' ? (
                        <span className="text-sky-600 italic">In Queue</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      {p.treatmentDurationMinutes !== null && p.treatmentDurationMinutes !== undefined ? (
                        <span className="text-slate-800">{p.treatmentDurationMinutes} mins</span>
                      ) : p.status === 'IN_TREATMENT' ? (
                        <span className="text-indigo-600 font-semibold animate-pulse">In Progress</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          title="View Chart & History"
                          onClick={() => setDetailPatient(p)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {p.status === 'WAITING' && (
                          <>
                            <button
                              title="Start Treatment"
                              disabled={actionLoading}
                              onClick={() => handleStartTreatment(p.id)}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-2xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <button
                              title="Re-Triage Severity"
                              onClick={() => setRetriagePatient(p)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            <button
                              title="Cancel Patient"
                              onClick={() => setCancelModalItem({ id: p.id, name: p.fullName })}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {p.status === 'IN_TREATMENT' && (
                          <button
                            title="Complete Treatment"
                            disabled={actionLoading}
                            onClick={() => handleCompleteTreatment(p.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing page {data.number + 1} of {data.totalPages} ({data.totalElements} records)
            </div>
            <div className="flex space-x-2">
              <button
                disabled={data.number === 0}
                onClick={() => setPage(data.number - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </button>
              <button
                disabled={data.number >= data.totalPages - 1}
                onClick={() => setPage(data.number + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PatientDetailModal
        patient={detailPatient}
        onClose={() => setDetailPatient(null)}
        onRetriage={(p) => setRetriagePatient(p)}
      />

      <RetriageModal
        patient={retriagePatient}
        isOpen={!!retriagePatient}
        onClose={() => setRetriagePatient(null)}
        onSuccess={() => {
          fetchRecords();
          onQueueUpdated();
        }}
      />

      <ConfirmModal
        isOpen={!!cancelModalItem}
        title="Cancel Patient Record?"
        message={`Are you sure you want to cancel the encounter for ${cancelModalItem?.name}?`}
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Record Active"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleCancelPatient}
        onCancel={() => setCancelModalItem(null)}
      />
    </div>
  );
};
