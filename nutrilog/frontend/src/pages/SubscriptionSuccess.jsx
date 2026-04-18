import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccess() {
  const { refreshProfile } = useAuth();
  const [params] = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(refreshProfile, 2000);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle size={64} className="text-green-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">You're all set! 🎉</h1>
      <p className="text-gray-500 mb-8">Your subscription has been activated. Enjoy all your new features!</p>
      <Link to="/dashboard" className="btn-primary px-10 py-3 text-base">Go to Dashboard</Link>
    </div>
  );
}
