import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
        {status === 'loading' && <><Loader size={48} className="mx-auto text-primary-500 animate-spin mb-4" /><p className="text-gray-600">Verifying your email...</p></>}
        {status === 'success' && <><CheckCircle size={48} className="mx-auto text-green-500 mb-4" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2><p className="text-gray-500 mb-6">Your email has been verified. You can now log in.</p><Link to="/login" className="btn-primary px-8 py-3">Go to Login</Link></>}
        {(status === 'error' || status === 'invalid') && <><XCircle size={48} className="mx-auto text-red-500 mb-4" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2><p className="text-gray-500 mb-6">This link is invalid or has expired.</p><Link to="/login" className="btn-primary px-8 py-3">Go to Login</Link></>}
      </div>
    </div>
  );
}
