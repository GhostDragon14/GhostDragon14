import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color = 'primary', progress, goal, subtitle }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };
  const pct = progress !== undefined && goal ? Math.min(100, Math.round((progress / goal) * 100)) : null;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</span>
            {unit && <span className="text-sm text-gray-500 dark:text-slate-400">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && <div className={`p-2.5 rounded-xl ${colors[color]}`}><Icon size={22} /></div>}
      </div>
      {pct !== null && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
            <span>{progress} / {goal} {unit}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
            <div className="h-2 rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
