import React, { useEffect, useState } from 'react';
import { WaitingTimeMetrics, AnalyticsSummary, SeverityDistribution } from '../types';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import {
  Clock,
  TrendingUp,
  Activity,
  Layers,
  Info,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<WaitingTimeMetrics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [severityDist, setSeverityDist] = useState<SeverityDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [m, s, d] = await Promise.all([
          api.getWaitingTimeMetrics(),
          api.getSummary(),
          api.getSeverityDistribution(),
        ]);
        setMetrics(m);
        setSummary(s);
        setSeverityDist(d);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Waiting-Time Analytics & Clinical Throughput
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rigorous calculations derived from actual server-recorded arrival, treatment start, and completion timestamps.
        </p>
      </div>

      {/* Methodology & Calculation Transparency Card */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-sky-900 text-sm mb-1">
              Documented Calculation Methodology & Population Criteria
            </h4>
            <p>
              <strong>Actual Wait Time:</strong> Formally defined as{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-mono text-sky-800">
                Duration(treatmentStartTime - arrivalTime)
              </code>{' '}
              in minutes.
            </p>
            <p className="mt-1">
              <strong>Eligible Population:</strong> Calculated strictly over patients who have been admitted into treatment (<span className="font-semibold text-slate-800">IN_TREATMENT</span> or <span className="font-semibold text-slate-800">COMPLETED</span>). Actively waiting patients are excluded from historical averages to prevent skewing prior to clinical admission.
            </p>
            <p className="mt-1">
              <strong>Treatment Duration:</strong> Calculated as{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-mono text-sky-800">
                Duration(treatmentEndTime - treatmentStartTime)
              </code>{' '}
              for all finalized encounters.
            </p>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Eligible Patient Count"
          value={metrics ? metrics.eligiblePatientCount : '-'}
          subtitle="Patients with recorded wait durations"
          icon={<Layers className="w-5 h-5" />}
          colorScheme="slate"
        />
        <StatCard
          title="Average Actual Wait"
          value={
            metrics && metrics.averageWaitMinutes !== null
              ? `${metrics.averageWaitMinutes} mins`
              : 'No Data'
          }
          subtitle="Mean duration from triage to treatment"
          icon={<Clock className="w-5 h-5" />}
          colorScheme="blue"
        />
        <StatCard
          title="Wait Time Extremes"
          value={
            metrics && metrics.minWaitMinutes !== null && metrics.maxWaitMinutes !== null
              ? `${metrics.minWaitMinutes}m - ${metrics.maxWaitMinutes}m`
              : 'No Data'
          }
          subtitle="Minimum and maximum recorded waits"
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="amber"
        />
        <StatCard
          title="Avg Treatment Duration"
          value={
            metrics && metrics.averageTreatmentDurationMinutes !== null
              ? `${metrics.averageTreatmentDurationMinutes} mins`
              : 'No Data'
          }
          subtitle="Bed occupancy per completed patient"
          icon={<Activity className="w-5 h-5" />}
          colorScheme="emerald"
        />
      </div>

      {/* Average Wait Time by Severity Tier */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Mean Actual Wait Duration by Urgency Tier
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Compares how prioritization successfully compresses wait times for higher urgency tiers.
        </p>

        {metrics && metrics.eligiblePatientCount === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            Honest State: No patients have started treatment yet. Admit patients from the Live Queue to compute actual wait durations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics &&
              metrics.averageWaitBySeverity &&
              Object.entries(metrics.averageWaitBySeverity).map(([sev, avg]) => {
                const colors: Record<string, { border: string; bg: string; text: string }> = {
                  CRITICAL: { border: 'border-red-200', bg: 'bg-red-50/40', text: 'text-red-700' },
                  HIGH: { border: 'border-orange-200', bg: 'bg-orange-50/40', text: 'text-orange-700' },
                  MEDIUM: { border: 'border-amber-200', bg: 'bg-amber-50/40', text: 'text-amber-700' },
                  LOW: { border: 'border-emerald-200', bg: 'bg-emerald-50/40', text: 'text-emerald-700' },
                };
                const style = colors[sev] || colors.LOW;

                return (
                  <div
                    key={sev}
                    className={`p-4 rounded-xl border ${style.border} ${style.bg} flex flex-col justify-between`}
                  >
                    <div>
                      <span className={`text-xs font-bold ${style.text}`}>{sev}</span>
                      <div className="mt-2 text-2xl font-bold text-slate-900">
                        {avg !== null ? `${avg} mins` : 'N/A'}
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {avg !== null
                        ? `Average actual wait for admitted ${sev} tier.`
                        : `No ${sev} patients admitted yet.`}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Hourly Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department Patient Throughput Over Time
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing registered patient arrivals against completed discharges per hourly interval.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center text-sky-600">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 mr-1.5" /> Arrivals
            </span>
            <span className="flex items-center text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5" /> Discharged
            </span>
          </div>
        </div>

        {metrics && metrics.hourlyVolumeTrends.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.hourlyVolumeTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timeSlot" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="arrivals"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Arrivals"
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Completions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-xs text-slate-400">
            No hourly telemetry data logged.
          </div>
        )}
      </div>
    </div>
  );
};
