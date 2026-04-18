import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Footprints, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import ProgressBar from '../components/common/ProgressBar';

export default function StepTracking() {
  const qc = useQueryClient();
  const [steps, setSteps] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: history } = useQuery('steps-history', () => api.get('/steps/history?days=30').then(r => r.data));

  const logMutation = useMutation((data) => api.post('/steps', data), {
    onSuccess: () => { qc.invalidateQueries('steps-history'); qc.invalidateQueries('dashboard-summary'); setSteps(''); toast.success('Steps logged!'); }
  });

  const todayLog = history?.logs?.find(l => format(new Date(l.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const goal = history?.goal || 10000;
  const todaySteps = todayLog?.steps || 0;

  const chartData = (history?.logs || []).slice(-14).map(l => ({
    date: format(new Date(l.date), 'MM/dd'),
    steps: l.steps,
  }));

  return (
    <div className="space-y-6">
      <h1 className="page-title">Step Tracking</h1>

      <div className="card text-center">
        <Footprints size={40} className="text-orange-500 mx-auto mb-2" />
        <p className="text-5xl font-bold text-gray-900 dark:text-white">{todaySteps.toLocaleString()}</p>
        <p className="text-gray-400 mt-1">steps today</p>
        <div className="mt-4 max-w-xs mx-auto">
          <ProgressBar value={todaySteps} max={goal} color="orange" size="lg" label={`Goal: ${goal.toLocaleString()} steps`} showPercent />
        </div>
        {todaySteps >= goal && <p className="text-green-500 font-semibold mt-3">🎉 Daily goal achieved!</p>}
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Log Steps</h3>
        <div className="flex gap-3">
          <input type="number" value={steps} onChange={e => setSteps(e.target.value)} className="input flex-1" placeholder="Enter step count" min="1" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-auto" />
          <button onClick={() => { if (steps) logMutation.mutate({ steps: parseInt(steps), date }); }} disabled={!steps || logMutation.isLoading} className="btn-primary px-6">
            {logMutation.isLoading ? '...' : 'Log'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[3000, 6000, 10000].map(n => (
            <button key={n} onClick={() => setSteps(n.toString())} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
              {n.toLocaleString()} steps
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">14-Day History</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [v.toLocaleString(), 'Steps']} />
              <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Goal', fontSize: 11, fill: '#f59e0b' }} />
              <Bar dataKey="steps" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="text-center text-gray-400 py-8">No step data yet</div>}
      </div>
    </div>
  );
}
