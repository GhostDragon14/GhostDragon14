import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Bell, Lock, Globe, Sun, Ruler, Target, Camera } from 'lucide-react';
import i18n from '../i18n/index.js';

export default function Settings() {
  const { user, updateUser, refreshProfile } = useAuth();
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', language: user?.language || 'en', heightCm: user?.heightCm || '', weightUnit: user?.weightUnit || 'kg', heightUnit: user?.heightUnit || 'cm' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [goalsForm, setGoalsForm] = useState({ calories: user?.goals?.calories || 2000, protein: user?.goals?.protein || 150, carbs: user?.goals?.carbs || 250, fat: user?.goals?.fat || 65, waterMl: user?.goals?.waterMl || 2000, steps: user?.goals?.steps || 10000, activityLevel: user?.goals?.activityLevel || 'moderate' });

  const profileMutation = useMutation((data) => api.put('/auth/profile', data), {
    onSuccess: (res) => { updateUser(res.data); i18n.changeLanguage(res.data.language); localStorage.setItem('nutrilog_lang', res.data.language); toast.success('Profile updated!'); }
  });

  const passMutation = useMutation((data) => api.put('/auth/password', data), {
    onSuccess: () => { setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); toast.success('Password changed!'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed')
  });

  const goalsMutation = useMutation((data) => api.put('/auth/goals', data), {
    onSuccess: () => { refreshProfile(); toast.success('Goals updated!'); }
  });

  const avatarMutation = useMutation((file) => {
    const fd = new FormData(); fd.append('avatar', file);
    return api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  }, { onSuccess: (res) => { updateUser({ avatar: res.data.avatar }); toast.success('Avatar updated!'); } });

  const verifyMutation = useMutation(() => api.post('/auth/resend-verification'), {
    onSuccess: () => toast.success('Verification email sent!')
  });

  const TABS = [{ id: 'profile', label: 'Profile', icon: User }, { id: 'goals', label: 'Goals', icon: Target }, { id: 'security', label: 'Security', icon: Lock }];

  return (
    <div className="space-y-6">
      <h1 className="page-title">{t('settings.title')}</h1>

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="card flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {user?.avatar ? <img src={user.avatar} className="w-16 h-16 object-cover" alt="" /> : user?.name?.[0]?.toUpperCase()}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600">
                <Camera size={12} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && avatarMutation.mutate(e.target.files[0])} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {!user?.emailVerified && (
                <button onClick={() => verifyMutation.mutate()} className="text-xs text-yellow-600 hover:underline mt-1">⚠️ Click to resend verification email</button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="card space-y-4">
            <h3 className="section-title">Profile Details</h3>
            <div><label className="label">Full Name</label><input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="input" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Height</label><input type="number" value={profileForm.heightCm} onChange={e => setProfileForm(f => ({ ...f, heightCm: e.target.value }))} className="input" placeholder="170" /></div>
              <div><label className="label">Height Unit</label><select value={profileForm.heightUnit} onChange={e => setProfileForm(f => ({ ...f, heightUnit: e.target.value }))} className="input"><option value="cm">cm</option><option value="ft">ft/in</option></select></div>
              <div><label className="label">Weight Unit</label><select value={profileForm.weightUnit} onChange={e => setProfileForm(f => ({ ...f, weightUnit: e.target.value }))} className="input"><option value="kg">kg</option><option value="lbs">lbs</option></select></div>
            </div>
            <button onClick={() => profileMutation.mutate(profileForm)} disabled={profileMutation.isLoading} className="btn-primary">Save Profile</button>
          </div>

          {/* Appearance */}
          <div className="card space-y-4">
            <h3 className="section-title">Appearance & Language</h3>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-gray-900 dark:text-white">{t('settings.theme')}</p><p className="text-sm text-gray-500">Currently: {theme}</p></div>
              <button onClick={toggle} className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div>
              <label className="label">{t('settings.language')}</label>
              <select value={profileForm.language} onChange={e => setProfileForm(f => ({ ...f, language: e.target.value }))} className="input w-auto">
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>
            <button onClick={() => profileMutation.mutate(profileForm)} disabled={profileMutation.isLoading} className="btn-primary">Save Preferences</button>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="card space-y-4">
          <h3 className="section-title">Nutrition & Fitness Goals</h3>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'calories', label: 'Daily Calories (kcal)', min: 800 }, { key: 'protein', label: 'Protein (g)', min: 0 }, { key: 'carbs', label: 'Carbs (g)', min: 0 }, { key: 'fat', label: 'Fat (g)', min: 0 }, { key: 'waterMl', label: 'Water (ml)', min: 0 }, { key: 'steps', label: 'Daily Steps', min: 0 }]
              .map(({ key, label, min }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input type="number" min={min} value={goalsForm[key]} onChange={e => setGoalsForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} className="input" />
                </div>
              ))}
            <div className="col-span-2">
              <label className="label">Activity Level</label>
              <select value={goalsForm.activityLevel} onChange={e => setGoalsForm(f => ({ ...f, activityLevel: e.target.value }))} className="input">
                <option value="sedentary">Sedentary (little exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (2x/day)</option>
              </select>
            </div>
          </div>
          <button onClick={() => goalsMutation.mutate(goalsForm)} disabled={goalsMutation.isLoading} className="btn-primary w-full py-3">
            {goalsMutation.isLoading ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card space-y-4">
          <h3 className="section-title">Change Password</h3>
          <div><label className="label">Current Password</label><input type="password" value={passForm.currentPassword} onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} className="input" /></div>
          <div><label className="label">New Password</label><input type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} className="input" /></div>
          <div><label className="label">Confirm New Password</label><input type="password" value={passForm.confirmPassword} onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input" /></div>
          <button onClick={() => { if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match'); passMutation.mutate(passForm); }} disabled={!passForm.currentPassword || !passForm.newPassword || passMutation.isLoading} className="btn-primary">
            {passMutation.isLoading ? 'Changing...' : 'Change Password'}
          </button>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">GDPR & Data Privacy</h4>
            <p className="text-sm text-gray-500 mb-3">You have the right to access, export, and delete your personal data at any time.</p>
            <div className="flex gap-2">
              <a href="/privacy" className="btn-secondary text-sm">Privacy Policy</a>
              <a href="/terms" className="btn-secondary text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
