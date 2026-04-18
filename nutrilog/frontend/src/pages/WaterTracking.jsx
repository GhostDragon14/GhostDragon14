import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import ProgressBar from '../components/common/ProgressBar';

const QUICK_AMOUNTS = [250, 350, 500, 750];

export default function WaterTracking() {
  const qc = useQueryClient();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [custom, setCustom] = useState('');

  const { data } = useQuery(['water', date], () => api.get(`/water?date=${date}`).then(r => r.data));

  const logMutation = useMutation((amountMl) => api.post('/water', { amountMl, date }), {
    onSuccess: () => { qc.invalidateQueries(['water', date]); qc.invalidateQueries('dashboard-summary'); toast.success('Water logged!'); }
  });

  const deleteMutation = useMutation((id) => api.delete(`/water/${id}`), {
    onSuccess: () => { qc.invalidateQueries(['water', date]); }
  });

  const totalMl = data?.totalMl || 0;
  const goalMl = data?.goalMl || 2000;
  const pct = Math.min(100, Math.round((totalMl / goalMl) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Water Intake</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-auto text-sm" />
      </div>

      <div className="card text-center">
        <div className="relative inline-flex items-center justify-center w-36 h-36 mx-auto mb-4">
          <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="2" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute">
            <Droplets size={28} className="text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{(totalMl / 1000).toFixed(1)}L</p>
            <p className="text-xs text-gray-400">{pct}%</p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-slate-400">Goal: {(goalMl / 1000).toFixed(1)}L ({goalMl} ml)</p>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Quick Add</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {QUICK_AMOUNTS.map(ml => (
            <button key={ml} onClick={() => logMutation.mutate(ml)} disabled={logMutation.isLoading}
              className="p-3 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center">
              <p className="text-sm font-bold text-blue-600">{ml >= 1000 ? `${ml/1000}L` : `${ml}ml`}</p>
              <p className="text-xs text-gray-400">{ml >= 250 ? `${ml/250} cup${ml/250 > 1 ? 's' : ''}` : ''}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="number" value={custom} onChange={e => setCustom(e.target.value)} className="input flex-1" placeholder="Custom amount (ml)" min="1" />
          <button onClick={() => { if (custom) { logMutation.mutate(parseFloat(custom)); setCustom(''); } }} className="btn-primary px-4">Add</button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Today's Log</h3>
        {(data?.logs || []).length === 0 ? (
          <p className="text-center text-gray-400 py-4">No water logged yet</p>
        ) : (
          <div className="space-y-2">
            {(data?.logs || []).map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <Droplets size={16} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.amountMl}ml</p>
                    <p className="text-xs text-gray-400">{format(new Date(log.createdAt), 'h:mm a')}</p>
                  </div>
                </div>
                <button onClick={() => deleteMutation.mutate(log.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
