import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { Plus, Trash2, Lock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format, startOfWeek, addDays } from 'date-fns';

const CATEGORIES = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'YOGA', 'SWIMMING', 'CYCLING', 'RUNNING', 'SPORTS', 'OTHER'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Workouts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isPremium = user?.subscription === 'PREMIUM' || user?.subscription === 'PREMIUM_PLUS';
  const [showLog, setShowLog] = useState(false);
  const [tab, setTab] = useState('history');
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  const [form, setForm] = useState({ name: '', category: 'STRENGTH', duration: 45, calories: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '', exercises: [] });

  const { data: workoutsData } = useQuery('workouts', () => api.get('/workouts?limit=30').then(r => r.data), { enabled: isPremium });
  const { data: schedule } = useQuery(['schedule', weekStart], () => api.get(`/workouts/schedule/week?weekStart=${weekStart}`).then(r => r.data), { enabled: isPremium });

  const logMutation = useMutation((data) => api.post('/workouts', data), {
    onSuccess: () => { qc.invalidateQueries('workouts'); setShowLog(false); resetForm(); toast.success('Workout logged!'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed')
  });

  const deleteMutation = useMutation((id) => api.delete(`/workouts/${id}`), {
    onSuccess: () => { qc.invalidateQueries('workouts'); toast.success('Deleted'); }
  });

  const toggleMutation = useMutation((id) => api.patch(`/workouts/schedule/${id}/toggle`), {
    onSuccess: () => qc.invalidateQueries(['schedule', weekStart])
  });

  const resetForm = () => setForm({ name: '', category: 'STRENGTH', duration: 45, calories: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '', exercises: [] });

  if (!isPremium) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Lock size={48} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Feature</h2>
      <p className="text-gray-500 mb-6">Upgrade to Premium to log workouts and view your fitness calendar.</p>
      <a href="/subscription" className="btn-primary px-8 py-3">Upgrade to Premium</a>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Workouts</h1>
        <button onClick={() => setShowLog(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Log Workout</button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        {[{ id: 'history', label: 'History' }, { id: 'calendar', label: 'Weekly Calendar' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'history' ? (
        <div className="space-y-3">
          {(workoutsData?.workouts || []).map(w => (
            <div key={w.id} className="card flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-lg">{getCategoryIcon(w.category)}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{w.name}</p>
                  <p className="text-sm text-gray-400">{w.category} · {w.duration} min{w.calories > 0 ? ` · ${Math.round(w.calories)} kcal` : ''}</p>
                  <p className="text-xs text-gray-400">{format(new Date(w.date), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(w.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={15} /></button>
            </div>
          ))}
          {(workoutsData?.workouts || []).length === 0 && <div className="text-center py-12 text-gray-400">No workouts logged yet.</div>}
        </div>
      ) : (
        <div className="card">
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, i) => {
              const daySchedules = (schedule || []).filter(s => s.dayOfWeek === i);
              return (
                <div key={day} className="min-h-28">
                  <div className="text-xs font-semibold text-gray-500 text-center mb-2">{day}</div>
                  <div className="space-y-1">
                    {daySchedules.map(s => (
                      <div key={s.id} className={`text-xs p-1.5 rounded-lg cursor-pointer transition-all ${s.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 line-through' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-primary-50'}`}
                        onClick={() => toggleMutation.mutate(s.id)}>
                        {s.completed && <Check size={10} className="inline mr-1" />}{s.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={showLog} onClose={() => { setShowLog(false); resetForm(); }} title="Log Workout" size="md">
        <div className="space-y-4">
          <div><label className="label">Workout Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Morning Run, Chest Day..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Duration (min) *</label><input type="number" min="1" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))} className="input" /></div>
            <div><label className="label">Calories Burned</label><input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} className="input" placeholder="Est. calories" /></div>
            <div><label className="label">Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" /></div>
          </div>
          <div><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" rows={2} placeholder="Optional notes..." /></div>
          <button onClick={() => logMutation.mutate(form)} disabled={!form.name || !form.duration || logMutation.isLoading} className="btn-primary w-full py-3">
            {logMutation.isLoading ? 'Logging...' : 'Log Workout'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

const getCategoryIcon = (cat) => ({ STRENGTH: '🏋️', CARDIO: '🏃', FLEXIBILITY: '🧘', HIIT: '⚡', YOGA: '🧘', SWIMMING: '🏊', CYCLING: '🚴', RUNNING: '🏃', SPORTS: '⚽', OTHER: '💪' }[cat] || '💪');
