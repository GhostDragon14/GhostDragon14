import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { Plus, Users, Lock, Search, Globe, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GOALS = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'ENDURANCE', 'FLEXIBILITY', 'GENERAL_FITNESS'];
const GOAL_ICONS = { WEIGHT_LOSS: '🔥', MUSCLE_GAIN: '💪', MAINTENANCE: '⚖️', ENDURANCE: '🏃', FLEXIBILITY: '🧘', GENERAL_FITNESS: '🏋️' };

export default function Groups() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isPP = user?.subscription === 'PREMIUM_PLUS';
  const [tab, setTab] = useState('discover');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [form, setForm] = useState({ name: '', description: '', goal: 'GENERAL_FITNESS', isPublic: true });

  const { data: publicGroups } = useQuery(['groups', searchQ], () => api.get(`/groups?search=${searchQ}`).then(r => r.data), { enabled: isPP });
  const { data: myGroups } = useQuery('my-groups', () => api.get('/groups/mine').then(r => r.data), { enabled: isPP });

  const createMutation = useMutation((data) => api.post('/groups', data), {
    onSuccess: () => { qc.invalidateQueries('my-groups'); setShowCreate(false); setForm({ name: '', description: '', goal: 'GENERAL_FITNESS', isPublic: true }); toast.success('Group created!'); }
  });

  const joinMutation = useMutation((groupId) => api.post(`/groups/${groupId}/join`), {
    onSuccess: () => { qc.invalidateQueries('my-groups'); qc.invalidateQueries(['groups', searchQ]); toast.success('Joined group!'); }
  });

  const joinCodeMutation = useMutation((code) => api.post('/groups/join-code', { code }), {
    onSuccess: () => { qc.invalidateQueries('my-groups'); setShowJoin(false); setJoinCode(''); toast.success('Joined group!'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Invalid code')
  });

  if (!isPP) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Users size={48} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Plus Feature</h2>
      <p className="text-gray-500 mb-6">Join community groups, take part in challenges, and stay motivated together.</p>
      <a href="/subscription" className="btn-primary px-8 py-3">Upgrade to Premium Plus</a>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Groups</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(true)} className="btn-secondary flex items-center gap-2"><Key size={16} /> Join by Code</button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Group</button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        {[{ id: 'discover', label: 'Discover' }, { id: 'mine', label: 'My Groups' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'discover' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} className="input pl-9" placeholder="Search groups..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(publicGroups || []).map(g => (
              <div key={g.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{GOAL_ICONS[g.goal]}</span>
                  <div><h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3><p className="text-xs text-gray-400">{g._count?.members || 0} members · {g.goal.replace('_', ' ')}</p></div>
                  {g.isPublic ? <Globe size={14} className="ml-auto text-gray-300" /> : <Lock size={14} className="ml-auto text-gray-300" />}
                </div>
                {g.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{g.description}</p>}
                <button onClick={() => joinMutation.mutate(g.id)} disabled={joinMutation.isLoading} className="btn-primary w-full text-sm py-2">Join Group</button>
              </div>
            ))}
            {(publicGroups || []).length === 0 && <div className="col-span-3 text-center py-8 text-gray-400">No public groups found.</div>}
          </div>
        </div>
      )}

      {tab === 'mine' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(myGroups || []).map(g => (
            <div key={g.id} className="card">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{GOAL_ICONS[g.goal]}</span>
                <div><h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3><p className="text-xs text-gray-400">{g._count?.members || 0} members</p></div>
              </div>
              {!g.isPublic && <div className="mt-3 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg"><p className="text-xs text-gray-500">Invite Code: <strong className="font-mono text-primary-600">{g.inviteCode}</strong></p></div>}
            </div>
          ))}
          {(myGroups || []).length === 0 && <div className="col-span-2 text-center py-8 text-gray-400">You haven't joined any groups yet.</div>}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Group">
        <div className="space-y-4">
          <div><label className="label">Group Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="My Fitness Squad" /></div>
          <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" rows={2} /></div>
          <div><label className="label">Fitness Goal</label><select value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} className="input">{GOALS.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}</select></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} /><span className="text-sm">Public group (anyone can join)</span></label>
          <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isLoading} className="btn-primary w-full py-3">{createMutation.isLoading ? 'Creating...' : 'Create Group'}</button>
        </div>
      </Modal>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join by Invite Code">
        <div className="space-y-4">
          <div><label className="label">Invite Code</label><input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} className="input font-mono text-lg tracking-widest" placeholder="ABC12345" maxLength={8} /></div>
          <button onClick={() => joinCodeMutation.mutate(joinCode)} disabled={joinCode.length < 4 || joinCodeMutation.isLoading} className="btn-primary w-full py-3">{joinCodeMutation.isLoading ? 'Joining...' : 'Join Group'}</button>
        </div>
      </Modal>
    </div>
  );
}
