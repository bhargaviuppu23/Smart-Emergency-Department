import React, { useState } from 'react';
import { Patient, Severity } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { api } from '../api/client';
import { X, ArrowRight, Check } from 'lucide-react';

interface RetriageModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RetriageModal: React.FC<RetriageModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !patient) return null;

  const currentSeverity = patient.severity;
  const newSeverity = selectedSeverity || currentSeverity;

  const severities: { key: Severity; label: string; desc: string }[] = [
    { key: 'CRITICAL', label: 'Level 1: Critical', desc: 'Immediate life-saving intervention needed.' },
    { key: 'HIGH', label: 'Level 2: High', desc: 'Emergent condition, high risk of rapid deterioration.' },
    { key: 'MEDIUM', label: 'Level 3: Medium', desc: 'Urgent, multiple resources needed but stable.' },
    { key: 'LOW', label: 'Level 4: Low', desc: 'Non-urgent routine care, minor illness/injury.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeverity && !notes) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.updatePatient(patient.id, {
        severity: selectedSeverity || undefined,
        triageNotes: notes ? `${patient.triageNotes || ''}\n[Re-Triage]: ${notes}`.trim() : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to re-triage patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900">Re-Triage Clinical Assessment</h3>
        <p className="text-xs text-slate-500 mt-1">
          Adjusting triage severity will dynamically re-position the patient in the Java PriorityQueue in O(log N) time.
        </p>

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Current Triage Level</span>
              <div className="mt-1">
                <SeverityBadge severity={currentSeverity} />
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />
            <div>
              <span className="text-slate-500 block">New Selected Level</span>
              <div className="mt-1">
                <SeverityBadge severity={newSeverity} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select New Severity Category
            </label>
            <div className="space-y-2">
              {severities.map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => setSelectedSeverity(s.key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between ${
                    (selectedSeverity || currentSeverity) === s.key
                      ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center">
                      <SeverityBadge severity={s.key} size="sm" showRank={false} />
                    </div>
                    <p className="mt-1 text-slate-500 text-[11px]">{s.desc}</p>
                  </div>
                  {(selectedSeverity || currentSeverity) === s.key && (
                    <Check className="w-4 h-4 text-sky-600 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Justification / Re-evaluation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vitals decompensated, escalated to Level 1 Critical."
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center"
            >
              {loading && (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
              )}
              Update Priority Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
