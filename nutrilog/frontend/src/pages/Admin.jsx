import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { Users, Shield, Plus, Trash2, Edit2, Search } from 'lucide-react';

export default function Admin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [diseaseModal, setDiseaseModal] = useState(false);
  const [diseaseForm, setDiseaseForm] = useState({ name: '', description: '', category: '', symptoms: '', dietaryRecs: '', exerciseRecs: '', avoidFoods: '', goodFoods: '', icdCode: '' });

  const { data: dashboard } = useQuery('admin-dashboard', () => api.get('/admin/dashboard').then(r => r.data));
  const { data: usersData } = useQuery(['admin-users', userSearch], () => api.get(`/admin/users?search=${userSearch}`).then(r => r.data), { enabled: tab === 'users' });
  const { data: diseases } = useQuery('admin-diseases', () => api.get('/admin/diseases').then(r => r.data), { enabled: tab === 'diseases' });

  const updateUserMutation = useMutation(({ id, data }) => api.put(`/admin/users/${id}`, data), {
    onSuccess: () => { qc.invalidateQueries(['admin-users', userSearch]); toast.success('User updated'); }
  });

  const createDiseaseMutation = useMutation((data) => api.post('/admin/diseases', data), {
    onSuccess: () => { qc.invalidateQueries('admin-diseases'); setDiseaseModal(false); resetDiseaseForm(); toast.success('Disease added!'); }
  });

  const deleteDiseaseMutation = useMutation((id) => api.delete(`/admin/diseases/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-diseases'); toast.success('Deleted'); }
  });

  const resetDiseaseForm = () => setDiseaseForm({ name: '', description: '', category: '', symptoms: '', dietaryRecs: '', exerciseRecs: '', avoidFoods: '', goodFoods: '', icdCode: '' });

  const parseCSV = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  const stats = dashboard?.stats || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-primary-600" />
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      {tab === 'overview' && dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[{ label: 'Total Users', value: stats.totalUsers }, { label: 'Free', value: stats.freeUsers }, { label: 'Premium', value: stats.premiumUsers }, { label: 'Premium+', value: stats.ppUsers }, { label: 'Food Logs', value: stats.totalFoodLogs }, { label: 'Workouts', value: stats.totalWorkouts }]
            .map(({ label, value }) => (
              <div key={label} className="card text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(value || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        {[{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'diseases', label: 'Disease Library' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} className="input pl-9" placeholder="Search by email or name..." />
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-slate-700">
                {['Name', 'Email', 'Plan', 'Verified', 'Role', 'Actions'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {(usersData?.users || []).map(u => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-2 px-3 text-gray-500">{u.email}</td>
                    <td className="py-2 px-3">
                      <select value={u.subscription} onChange={e => updateUserMutation.mutate({ id: u.id, data: { subscription: e.target.value } })} className="text-xs border border-gray-200 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
                        <option value="FREE">Free</option><option value="PREMIUM">Premium</option><option value="PREMIUM_PLUS">Premium+</option>
                      </select>
                    </td>
                    <td className="py-2 px-3"><span className={`badge ${u.emailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.emailVerified ? 'Yes' : 'No'}</span></td>
                    <td className="py-2 px-3">
                      <select value={u.role} onChange={e => updateUserMutation.mutate({ id: u.id, data: { role: e.target.value } })} className="text-xs border border-gray-200 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
                        <option value="USER">User</option><option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      {!u.emailVerified && <button onClick={() => updateUserMutation.mutate({ id: u.id, data: { emailVerified: true } })} className="text-xs text-primary-600 hover:underline">Verify</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'diseases' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setDiseaseModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Disease</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(diseases || []).map(d => (
              <div key={d.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                    <p className="text-xs text-gray-400">{d.category}{d.icdCode ? ` · ICD: ${d.icdCode}` : ''}</p>
                  </div>
                  <button onClick={() => deleteDiseaseMutation.mutate(d.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{d.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.dietaryRecs?.slice(0, 2).map((r, i) => <span key={i} className="badge bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">{r}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={diseaseModal} onClose={() => { setDiseaseModal(false); resetDiseaseForm(); }} title="Add Disease to Library" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Disease Name *</label><input value={diseaseForm.name} onChange={e => setDiseaseForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Type 2 Diabetes" /></div>
            <div><label className="label">Category *</label><input value={diseaseForm.category} onChange={e => setDiseaseForm(f => ({ ...f, category: e.target.value }))} className="input" placeholder="Metabolic, Cardiovascular..." /></div>
            <div><label className="label">ICD Code</label><input value={diseaseForm.icdCode} onChange={e => setDiseaseForm(f => ({ ...f, icdCode: e.target.value }))} className="input" placeholder="E11" /></div>
            <div className="col-span-2"><label className="label">Description *</label><textarea value={diseaseForm.description} onChange={e => setDiseaseForm(f => ({ ...f, description: e.target.value }))} className="input" rows={2} /></div>
            {[['symptoms', 'Symptoms (comma-separated)'], ['dietaryRecs', 'Dietary Recommendations'], ['exerciseRecs', 'Exercise Recommendations'], ['avoidFoods', 'Foods to Avoid'], ['goodFoods', 'Recommended Foods']]
              .map(([key, label]) => (
                <div key={key} className="col-span-2"><label className="label">{label}</label><input value={diseaseForm[key]} onChange={e => setDiseaseForm(f => ({ ...f, [key]: e.target.value }))} className="input" placeholder="Item 1, Item 2, Item 3" /></div>
              ))}
          </div>
          <button onClick={() => createDiseaseMutation.mutate({ ...diseaseForm, symptoms: parseCSV(diseaseForm.symptoms), dietaryRecs: parseCSV(diseaseForm.dietaryRecs), exerciseRecs: parseCSV(diseaseForm.exerciseRecs), avoidFoods: parseCSV(diseaseForm.avoidFoods), goodFoods: parseCSV(diseaseForm.goodFoods) })}
            disabled={!diseaseForm.name || !diseaseForm.description || createDiseaseMutation.isLoading} className="btn-primary w-full py-3">
            {createDiseaseMutation.isLoading ? 'Adding...' : 'Add Disease'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
