import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Mail size={40} className="mx-auto text-primary-500 mb-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Enter your email and we'll send a reset link</p>
          </div>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">Reset link sent!</p>
              <p className="text-gray-500 text-sm mt-2">Check your email inbox and spam folder.</p>
              <Link to="/login" className="btn-primary mt-4 px-8 inline-block">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <p className="text-center mt-4"><Link to="/login" className="text-sm text-primary-600 hover:underline">&larr; Back to login</Link></p>
        </div>
      </div>
    </div>
  );
}
