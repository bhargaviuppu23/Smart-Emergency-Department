import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorScheme?: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'slate';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colorScheme = 'blue',
  badge,
}) => {
  const colorStyles = {
    blue: 'border-sky-100 bg-white hover:border-sky-300 text-sky-600',
    red: 'border-red-100 bg-white hover:border-red-300 text-red-600',
    amber: 'border-amber-100 bg-white hover:border-amber-300 text-amber-600',
    emerald: 'border-emerald-100 bg-white hover:border-emerald-300 text-emerald-600',
    purple: 'border-indigo-100 bg-white hover:border-indigo-300 text-indigo-600',
    slate: 'border-slate-200 bg-white hover:border-slate-300 text-slate-600',
  };

  const iconBgStyles = {
    blue: 'bg-sky-50 text-sky-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-indigo-50 text-indigo-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${colorStyles[colorScheme]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${iconBgStyles[colorScheme]}`}>{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
