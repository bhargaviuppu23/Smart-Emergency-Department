import React, { useEffect, useState } from 'react';
import {
  AnalyticsSummary,
  QueueItem,
  QueueEvent,
  SeverityDistribution,
  WaitingTimeMetrics,
} from '../types';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { NavTab } from '../components/Navbar';
import {
  Users,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle,
  Play,
  ArrowRight,
  TrendingUp,
  History,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onRefreshQueue: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onRefreshQueue }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [nextPatient, setNextPatient] = useState<QueueItem | null>(null);
  const [recentEvents, setRecentEvents] = useState<QueueEvent[]>([]);
  const [severityDist, setSeverityDist] = useState<SeverityDistribution[]>([]);
  const [waitMetrics, setWaitMetrics] = useState<WaitingTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingTreatment, setStartingTreatment] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, nextData, eventsData, distData, metricsData] = await Promise.all([
        api.getSummary(),
        api.peekNext(),
        api.getRecentEvents(8),
        api.getSeverityDistribution(),
        api.getWaitingTimeMetrics(),
      ]);
      setSummary(sumData);
      setNextPatient(nextData);
      setRecentEvents(eventsData);
      setSeverityDist(distData);
      setWaitMetrics(metricsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartNext = async () => {
    try {
      setStartingTreatment(true);
      setActionMessage(null);
      const res = await api.startNext();
      setActionMessage(`Treatment started for ${res.fullName} (${res.patientIdentifier}).`);
      onRefreshQueue();
      await loadData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to start treatment.');
    } finally {
      setStartingTreatment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hospital Operations Overview
            </h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time emergency department prioritization powered by Java PriorityQueue & FIFO tie-breaking.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('simulation')}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Demo Simulation
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-xs"
          >
            + Register Patient
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-sky-600 hover:text-sky-800 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Registered"
          value={summary ? summary.totalRegistered : '-'}
          subtitle="All patient encounters"
          icon={<Users className="w-5 h-5" />}
          colorScheme="slate"
        />
        <StatCard
          title="Waiting in Queue"
          value={summary ? summary.waitingCount : '-'}
          subtitle="Actively in PriorityQueue"
          icon={<Clock className="w-5 h-5" />}
          colorScheme="blue"
        />
        <StatCard
          title="Critical / Emergent"
          value={summary ? summary.criticalCount + summary.highPriorityCount : '-'}
          subtitle="Levels 1 & 2 requiring urgency"
          icon={<AlertTriangle className="w-5 h-5" />}
          colorScheme="red"
          badge={summary && summary.criticalCount > 0 ? `${summary.criticalCount} Critical` : undefined}
        />
        <StatCard
          title="In Treatment"
          value={summary ? summary.inTreatmentCount : '-'}
          subtitle="Current bed occupancy (Max 1)"
          icon={<Activity className="w-5 h-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="Completed / Discharged"
          value={summary ? summary.completedCount : '-'}
          subtitle="Treatments finalized"
          icon={<CheckCircle className="w-5 h-5" />}
          colorScheme="emerald"
        />
        <StatCard
          title="Average Actual Wait"
          value={
            summary && summary.averageWaitMinutes !== null
              ? `${summary.averageWaitMinutes}m`
              : 'N/A'
          }
          subtitle="Eligible admitted patients"
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="amber"
        />
      </div>

      {/* Next Eligible Patient Callout Banner */}
      {nextPatient ? (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white border border-sky-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              #1
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {nextPatient.patientIdentifier}
                </span>
                <SeverityBadge severity={nextPatient.severity} />
                <span className="text-xs text-slate-500">
                  Waiting: <strong className="text-slate-800">{nextPatient.currentWaitMinutes} mins</strong>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Next in Line: {nextPatient.fullName} (Age: {nextPatient.age})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                Complaint: {nextPatient.presentingComplaint}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-center">
            <button
              onClick={() => onNavigate('live-queue')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            >
              View Full Queue
            </button>
            <button
              disabled={startingTreatment || (summary?.inTreatmentCount || 0) >= 1}
              onClick={handleStartNext}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg flex items-center shadow-xs transition-colors ${
                (summary?.inTreatmentCount || 0) >= 1
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              {(summary?.inTreatmentCount || 0) >= 1
                ? 'Treatment Bed Full'
                : 'Admit to Treatment Bed'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">PriorityQueue is Currently Empty</h4>
          <p className="text-xs text-slate-500 mt-1">
            No patients waiting for treatment. Register a patient or run demo simulation.
          </p>
          <div className="mt-3 flex justify-center space-x-3">
            <button
              onClick={() => onNavigate('register')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800"
            >
              + Register Patient
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onNavigate('simulation')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-800"
            >
              Run Demo Generator
            </button>
          </div>
        </div>
      )}

      {/* Analytics Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Waiting Queue Severity Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of active queue by urgency level</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center"
            >
              Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {severityDist.every((d) => d.count === 0) ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No active patients in queue to plot.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Waiting Patients">
                    {severityDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Hourly Volume Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Arrivals vs Completions</h3>
              <p className="text-xs text-slate-500">Hourly throughput trend over past 12 hours</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center"
            >
              More <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {waitMetrics && waitMetrics.hourlyVolumeTrends.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={waitMetrics.hourlyVolumeTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timeSlot" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="arrivals"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Arrivals"
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No historical trend data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Events Audit Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent Queue Events & Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Auto-refreshed</span>
        </div>

        {recentEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No queue events logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentEvents.map((ev) => (
              <div key={ev.id} className="py-2.5 flex items-start justify-between text-xs">
                <div className="flex items-start space-x-3">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium mt-0.5">
                    {ev.eventType}
                  </span>
                  <div>
                    <p className="text-slate-800 font-medium">{ev.description}</p>
                    {ev.patientIdentifier && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Patient Ref: {ev.patientIdentifier}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
