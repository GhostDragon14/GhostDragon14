import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const requirements = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'Passwords match', met: form.password === form.confirmPassword && form.confirmPassword.length > 0 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success('Account created! Please verify your email.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🥗</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">NutriLog</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Start tracking your health today</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('auth.name')}</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="John Doe" />
            </div>
            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="input" placeholder="••••••••" />
            </div>
            {form.password && (
              <div className="space-y-1">
                {requirements.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${r.met ? 'text-green-600' : 'text-gray-400'}`}>
                    <Check size={12} className={r.met ? 'text-green-600' : 'text-gray-300'} />
                    {r.label}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
            {t('auth.hasAccount')} <Link to="/login" className="text-primary-600 font-medium hover:underline">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
