import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export default function MacroPieChart({ protein, carbs, fat }) {
  const data = [
    { name: 'Protein', value: Math.round(protein * 4), grams: Math.round(protein) },
    { name: 'Carbs', value: Math.round(carbs * 4), grams: Math.round(carbs) },
    { name: 'Fat', value: Math.round(fat * 9), grams: Math.round(fat) },
  ].filter(d => d.value > 0);

  if (!data.length) return <div className="flex items-center justify-center h-40 text-gray-400">No data</div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const { name, grams, value } = payload[0].payload;
      return <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 text-xs border border-gray-100 dark:border-slate-700"><p className="font-semibold">{name}</p><p>{grams}g · {value} kcal</p></div>;
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value) => <span className="text-xs text-gray-600 dark:text-slate-400">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
