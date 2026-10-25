import React, { useState } from 'react';
import { Severity, PatientRequest } from '../types';
import { api } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { NavTab } from '../components/Navbar';
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface RegistrationPageProps {
  onSuccessNavigate: (tab: NavTab) => void;
  onPatientAdded: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onSuccessNavigate,
  onPatientAdded,
}) => {
  const [formData, setFormData] = useState<PatientRequest>({
    fullName: '',
    age: 35,
    gender: 'Other',
    presentingComplaint: '',
    severity: 'MEDIUM',
    triageNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const severityOptions: {
    key: Severity;
    title: string;
    description: string;
    examples: string;
  }[] = [
    {
      key: 'CRITICAL',
      title: 'Level 1: Critical (Immediate)',
      description: 'Immediate threat to life or limb. Continuous resuscitation required.',
      examples: 'Cardiac arrest, severe respiratory failure, code stroke, anaphylaxis.',
    },
    {
      key: 'HIGH',
      title: 'Level 2: High (Emergent)',
      description: 'High risk of deterioration, intense pain, or altered mental status.',
      examples: 'Severe chest pain, open compound fractures, severe acute asthma.',
    },
    {
      key: 'MEDIUM',
      title: 'Level 3: Medium (Urgent)',
      description: 'Stable vital signs, but requires multiple hospital diagnostics or care.',
      examples: 'Moderate abdominal pain, high fever with chills, uncomplicated fractures.',
    },
    {
      key: 'LOW',
      title: 'Level 4: Low (Non-Urgent)',
      description: 'Simple evaluation, routine medication refill, or minor single injury.',
      examples: 'Minor laceration, mild sprain, routine prescription renewal.',
    },
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Patient name is required.';
    } else if (formData.fullName.trim().length > 120) {
      errs.fullName = 'Name cannot exceed 120 characters.';
    }

    if (formData.age === undefined || formData.age === null) {
      errs.age = 'Age is required.';
    } else if (formData.age < 0 || formData.age > 130) {
      errs.age = 'Age must be between 0 and 130.';
    }

    if (!formData.presentingComplaint.trim()) {
      errs.presentingComplaint = 'Chief presenting complaint is required.';
    } else if (formData.presentingComplaint.trim().length > 255) {
      errs.presentingComplaint = 'Complaint cannot exceed 255 characters.';
    }

    if (!formData.severity) {
      errs.severity = 'Triage severity must be selected.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setServerError(null);
      await api.registerPatient(formData);
      onPatientAdded();
      onSuccessNavigate('live-queue');
    } catch (err: any) {
      setServerError(err.message || 'Failed to register patient in triage queue.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickPreset = (preset: Partial<PatientRequest>) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Educational Simulation Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Educational Emergency Triage Simulation</h4>
          <p className="mt-0.5 text-amber-800">
            This module simulates how clinical triage assigns urgency and how the Java PriorityQueue
            schedules patient treatment based on severity rank and chronological FIFO tie-breakers.
            Never enter real identifying medical health records.
          </p>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-sky-600" />
              Patient Registration & Triage Intake
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit patient details to be evaluated and scheduled into the emergency priority queue.
            </p>
          </div>

          {/* Quick presets for rapid simulation testing */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() =>
                fillQuickPreset({
                  fullName: 'Robert Hayes',
                  age: 62,
                  gender: 'Male',
                  severity: 'CRITICAL',
                  presentingComplaint: 'Crushing retrosternal chest pain with left arm radiation',
                  triageNotes: 'Vitals unstable, immediate EKG protocol requested.',
                })
              }
              className="px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 font-medium hover:bg-red-100"
            >
              STEMI (Crit)
            </button>
            <button
              type="button"
              onClick={() =>
                fillQuickPreset({
                  fullName: 'Sarah Jenkins',
                  age: 27,
                  gender: 'Female',
                  severity: 'HIGH',
                  presentingComplaint: 'Severe acute asthma exacerbation, audible wheezing',
                  triageNotes: 'Room air SpO2 90%, nebulizer treatment needed.',
                })
              }
              className="px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200 font-medium hover:bg-orange-100"
            >
              Asthma (High)
            </button>
            <button
              type="button"
              onClick={() =>
                fillQuickPreset({
                  fullName: 'Michael Chen',
                  age: 19,
                  gender: 'Male',
                  severity: 'LOW',
                  presentingComplaint: 'Right ankle lateral inversion sprain after sports',
                  triageNotes: 'Able to bear weight with mild discomfort, X-ray ordered.',
                })
              }
              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100"
            >
              Sprain (Low)
            </button>
          </div>
        </div>

        {serverError && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Patient Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name / Demo Label *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Johnathan Miller"
                  className={`w-full text-xs rounded-xl border p-3 focus:outline-none focus:ring-1 ${
                    errors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                      : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className={`w-full text-xs rounded-xl border p-3 focus:outline-none focus:ring-1 ${
                    errors.age
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                      : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500'
                  }`}
                />
                {errors.age && <p className="mt-1 text-[11px] text-red-600">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-1 focus:border-sky-500 focus:ring-sky-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Queue Identifiers
                </label>
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-500 flex items-center justify-between">
                  <span>Server-Assigned Prefix: <strong className="font-mono text-slate-800">ED-YYYYMMDD-XXXX</strong></span>
                  <span className="flex items-center text-emerald-600">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Monotonic Timestamp Clock
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Severity Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Emergency Severity Level (ESI-Based Ranking) *
              </h3>
              <SeverityBadge severity={formData.severity} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {severityOptions.map((opt) => {
                const isSelected = formData.severity === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => setFormData({ ...formData, severity: opt.key })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900">{opt.title}</div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                      Examples: {opt.examples}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Clinical Presentation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Clinical Presentation & Triage Notes
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presenting Chief Complaint *
                </label>
                <input
                  type="text"
                  value={formData.presentingComplaint}
                  onChange={(e) =>
                    setFormData({ ...formData, presentingComplaint: e.target.value })
                  }
                  placeholder="e.g. Acute severe lower right quadrant abdominal pain"
                  className={`w-full text-xs rounded-xl border p-3 focus:outline-none focus:ring-1 ${
                    errors.presentingComplaint
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                      : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500'
                  }`}
                />
                {errors.presentingComplaint && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.presentingComplaint}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Triage Assessment Notes & Initial Observations
                </label>
                <textarea
                  rows={3}
                  value={formData.triageNotes || ''}
                  onChange={(e) => setFormData({ ...formData, triageNotes: e.target.value })}
                  placeholder="Record initial vitals (HR, BP, SpO2), pain scale, triage nurse impressions..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onSuccessNavigate('live-queue')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all flex items-center"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              )}
              Enqueue Patient into PriorityQueue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
