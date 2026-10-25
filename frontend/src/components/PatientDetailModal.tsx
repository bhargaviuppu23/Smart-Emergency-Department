import React, { useEffect, useState } from 'react';
import { Patient, QueueEvent } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { api } from '../api/client';
import { X, Clock, Calendar, Hash, Activity, FileText, User, HeartPulse } from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  onRetriage?: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onRetriage,
}) => {
  const [events, setEvents] = useState<QueueEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (patient) {
      setLoadingEvents(true);
      api
        .getPatientEvents(patient.id)
        .then(setEvents)
        .catch(console.error)
        .finally(() => setLoadingEvents(false));
    }
  }, [patient]);

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              {patient.patientIdentifier}
            </span>
            <SeverityBadge severity={patient.severity} />
            <StatusBadge status={patient.status} />
            {patient.demo && (
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Simulation Demo
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">{patient.fullName}</h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 space-x-4">
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1" /> Age: {patient.age} yrs
            </span>
            {patient.gender && <span>Gender: {patient.gender}</span>}
            <span className="flex items-center">
              <Hash className="w-3.5 h-3.5 mr-1" /> Monotonic Seq #{patient.arrivalSequenceNumber}
            </span>
          </div>
        </div>

        {/* Clinical Presentation & Notes */}
        <div className="mt-4 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
              <HeartPulse className="w-4 h-4 mr-1 text-red-500" /> Presenting Chief Complaint
            </h4>
            <p className="mt-1 text-sm font-medium text-slate-900">{patient.presentingComplaint}</p>
          </div>

          {patient.triageNotes && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-1 text-sky-500" /> Triage Assessment Notes
              </h4>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{patient.triageNotes}</p>
            </div>
          )}

          {/* Timing & Wait Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-lg border border-slate-200 p-3 bg-white">
              <span className="text-[11px] font-medium text-slate-500">Arrival Time</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {new Date(patient.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-white">
              <span className="text-[11px] font-medium text-slate-500">Queue Position</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {patient.queuePosition ? `#${patient.queuePosition} in Line` : 'Not in queue'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-white">
              <span className="text-[11px] font-medium text-slate-500">Actual Wait</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {patient.actualWaitDurationMinutes !== null && patient.actualWaitDurationMinutes !== undefined
                  ? `${patient.actualWaitDurationMinutes} mins`
                  : 'Awaiting treatment'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-white">
              <span className="text-[11px] font-medium text-slate-500">Treatment Duration</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {patient.treatmentDurationMinutes !== null && patient.treatmentDurationMinutes !== undefined
                  ? `${patient.treatmentDurationMinutes} mins`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Audit Event Timeline */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center mb-3">
              <Activity className="w-4 h-4 mr-1 text-indigo-500" /> Lifecycle Audit Trail
            </h4>

            {loadingEvents ? (
              <div className="text-xs text-slate-400 py-3 text-center">Loading audit events...</div>
            ) : events.length === 0 ? (
              <div className="text-xs text-slate-400 py-2">No event records found.</div>
            ) : (
              <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                {events.map((ev) => (
                  <div key={ev.id} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white ring-1 ring-slate-200" />
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      <span className="font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        {ev.eventType}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-0.5">{ev.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
          {onRetriage && patient.status === 'WAITING' ? (
            <button
              onClick={() => {
                onClose();
                onRetriage(patient);
              }}
              className="text-xs font-medium text-sky-600 hover:text-sky-800 border border-sky-200 hover:border-sky-300 rounded-lg px-3 py-1.5 bg-sky-50 transition-colors"
            >
              Re-Triage Severity
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
