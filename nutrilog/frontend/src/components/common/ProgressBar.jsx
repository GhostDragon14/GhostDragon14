import React from 'react';

export default function ProgressBar({ value, max, color = 'primary', size = 'md', label, showPercent }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    primary: 'bg-primary-500', blue: 'bg-blue-500', purple: 'bg-purple-500',
    orange: 'bg-orange-500', red: 'bg-red-500', yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 dark:bg-slate-700 rounded-full ${heights[size]}`}>
        <div className={`${heights[size]} rounded-full ${colors[color]} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
