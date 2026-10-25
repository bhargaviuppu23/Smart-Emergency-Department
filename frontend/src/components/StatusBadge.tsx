import React from 'react';
import { PatientStatus } from '../types';
import { Clock, Activity, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PatientStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs: Record<
    PatientStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    WAITING: {
      label: 'Waiting in Queue',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-sky-600" />,
    },
    IN_TREATMENT: {
      label: 'In Treatment Bed',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <Activity className="w-3.5 h-3.5 mr-1 text-indigo-600 animate-spin" />,
    },
    COMPLETED: {
      label: 'Treatment Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    CANCELLED: {
      label: 'Cancelled / LWBS',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      icon: <XCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />,
    },
  };

  const config = configs[status] || configs.WAITING;

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
