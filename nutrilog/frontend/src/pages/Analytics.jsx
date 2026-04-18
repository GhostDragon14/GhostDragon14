import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const MACRO_COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export default function Analytics() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);

  const { data: calories } = useQuery(['cal-history', days], () => api.get(`/analytics/calories?days=${days}`).then(r => r.data));
  const { data: macros } = useQuery(['macros', days], () => api.get(`/analytics/macros?days=${days}`).then(r => r.data));
  const { data: workoutStats } = useQuery(['workout-stats', days], () => api.get(`/analytics/workouts?days=${days}`).then(r => r.data));
  const { data: weightTrend } = useQuery(['weight-trend', days], () => api.get(`/analytics/weight-trend?days=${days}`).then(r => r.data));

  const isPremiumPlus = user?.subscription === 'PREMIUM_PLUS';

  const calData = (calories?.data || []).map(d => ({ ...d, date: format(new Date(d.date), 'MM/dd') }));
  const weightData = (weightTrend?.data || []).map(d => ({ ...d, date: format(new Date(d.date), 'MM/dd') }));
  const workoutCatData = Object.entries(workoutStats?.byCategory || {}).map(([name, value]) => ({ name, value }));
  const macroData = macros ? [{ name: 'Protein', value: macros.average?.protein || 0, fill: '#10b981' }, { name: 'Carbs', value: macros.average?.carbs || 0, fill: '#3b82f6' }, { name: 'Fat', value: macros.average?.fat || 0, fill: '#f59e0b' }] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Analytics</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === d ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Calorie Summary */}
      {calories && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Daily Calories</h3>
            <span className="text-sm text-gray-500">Avg: <strong className="text-gray-900 dark:text-white">{calories.average} kcal</strong></span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={calData}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`${v} kcal`, 'Calories']} />
              <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} fill="url(#cg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Breakdown */}
        <div className="card">
          <h3 className="section-title mb-4">Avg Daily Macros</h3>
          {macroData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {macroData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={v => [`${v}g`, '']} />
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-center text-gray-400 py-8">No data</div>}
        </div>

        {/* Workout Categories */}
        <div className="card">
          <h3 className="section-title mb-4">Workouts by Category</h3>
          {workoutCatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={workoutCatData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-center text-gray-400 py-8">No workout data</div>}
        </div>
      </div>

      {/* Weight Trend */}
      {weightData.length > 1 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Weight Trend</h3>
            {weightTrend?.trend !== null && <span className="text-sm text-gray-500">Change: <strong className={weightTrend.trend < 0 ? 'text-green-500' : 'text-red-400'}>{weightTrend.trend > 0 ? '+' : ''}{weightTrend.trend} kg</strong></span>}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Premium Plus Upsell */}
      {!isPremiumPlus && (
        <div className="card border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-purple-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Unlock Premium Plus Analytics</p>
              <p className="text-sm text-gray-500">Progress photos, health recommendations, group challenges & more.</p>
            </div>
            <a href="/subscription" className="ml-auto btn-primary bg-purple-500 hover:bg-purple-600 whitespace-nowrap">Upgrade</a>
          </div>
        </div>
      )}
    </div>
  );
}
