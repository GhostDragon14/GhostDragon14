import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scale, Lock, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function WeightTracking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isPremium = user?.subscription === 'PREMIUM' || user?.subscription === 'PREMIUM_PLUS';
  const [form, setForm] = useState({ weight: '', unit: user?.weightUnit || 'kg', date: format(new Date(), 'yyyy-MM-dd'), note: '' });

  const { data } = useQuery('weight-history', () => api.get('/weight/history?days=90').then(r => r.data), { enabled: isPremium });

  const logMutation = useMutation((data) => api.post('/weight', data), {
    onSuccess: () => { qc.invalidateQueries('weight-history'); qc.invalidateQueries('dashboard-summary'); setForm(f => ({ ...f, weight: '' })); toast.success('Weight logged!'); }
  });

  const deleteMutation = useMutation((id) => api.delete(`/weight/${id}`), {
    onSuccess: () => qc.invalidateQueries('weight-history')
  });

  if (!isPremium) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Lock size={48} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Feature</h2>
      <p className="text-gray-500 mb-6">Upgrade to track weight and view progress graphs.</p>
      <a href="/subscription" className="btn-primary px-8 py-3">Upgrade to Premium</a>
    </div>
  );

  const chartData = (data?.logs || []).map(l => ({ date: format(new Date(l.date), 'MM/dd'), weight: l.weight }));
  const bmi = data?.bmi;
  const trend = data?.trend;
  const latest = data?.latest;

  const bmiColor = bmi ? (bmi.value < 18.5 ? 'text-blue-500' : bmi.value < 25 ? 'text-green-500' : bmi.value < 30 ? 'text-yellow-500' : 'text-red-500') : '';

  return (
    <div className="space-y-6">
      <h1 className="page-title">Weight Tracking</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <Scale size={28} className="mx-auto text-primary-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{latest ? `${latest.weight} ${latest.unit}` : '--'}</p>
          <p className="text-xs text-gray-400">Latest weight</p>
        </div>
        <div className="card text-center">
          {trend !== null && trend !== undefined ? (
            <><div className="flex items-center justify-center gap-1 mb-1">{trend < 0 ? <TrendingDown size={24} className="text-green-500" /> : <TrendingUp size={24} className="text-red-400" />}<p className={`text-3xl font-bold ${trend < 0 ? 'text-green-500' : 'text-red-400'}`}>{trend > 0 ? '+' : ''}{trend} {latest?.unit}</p></div><p className="text-xs text-gray-400">90-day change</p></>
          ) : (<><p className="text-3xl font-bold text-gray-400">--</p><p className="text-xs text-gray-400">90-day change</p></>)}
        </div>
        <div className="card text-center">
          {bmi ? (<><p className={`text-3xl font-bold ${bmiColor}`}>{bmi.value}</p><p className="text-sm text-gray-500">{bmi.category}</p><p className="text-xs text-gray-400">BMI</p></>) : (<><p className="text-3xl font-bold text-gray-400">--</p><p className="text-xs text-gray-400">BMI (set height in settings)</p></>)}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Log Weight</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Weight *</label>
            <input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input" placeholder="75.5" />
          </div>
          <div>
            <label className="label">Unit</label>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input">
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
          </div>
          <div className="flex items-end">
            <button onClick={() => { if (form.weight) logMutation.mutate(form); }} disabled={!form.weight || logMutation.isLoading} className="btn-primary w-full">
              {logMutation.isLoading ? '...' : 'Log'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Progress Chart (90 days)</h3>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} ${latest?.unit}`, 'Weight']} />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="text-center text-gray-400 py-8">Log weight on multiple days to see your progress chart.</div>}
      </div>
    </div>
  );
}
