import React from 'react';
import { Severity } from '../types';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showRank?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showRank = true,
  size = 'md',
}) => {
  const configs: Record<
    Severity,
    { label: string; rank: number; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    CRITICAL: {
      label: 'Level 1: Critical',
      rank: 1,
      bg: 'bg-red-50 text-red-700 border-red-300',
      text: 'text-red-700',
      border: 'border-red-300',
      icon: <AlertOctagon className="w-3.5 h-3.5 mr-1 animate-pulse text-red-600" />,
    },
    HIGH: {
      label: 'Level 2: High',
      rank: 2,
      bg: 'bg-orange-50 text-orange-700 border-orange-300',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-orange-600" />,
    },
    MEDIUM: {
      label: 'Level 3: Medium',
      rank: 3,
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
    },
    LOW: {
      label: 'Level 4: Low',
      rank: 4,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
  };

  const config = configs[severity] || configs.LOW;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${sizeClasses[size]}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showRank && (
        <span className="ml-1 opacity-70 font-mono text-[10px]">
          [P{config.rank}]
        </span>
      )}
    </span>
  );
};
