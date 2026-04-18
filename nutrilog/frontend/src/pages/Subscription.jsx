import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Check, Zap, Crown, Star } from 'lucide-react';

const PLAN_CONFIGS = [
  { id: 'FREE', name: 'Free', price: 0, icon: Star, color: 'gray', features: ['Food logging (Nutritionix + USDA)', 'Barcode scanning', '2 custom recipes/week', 'Water intake tracking', 'Daily step count', 'Basic analytics', 'Email verification', 'EN/ES/FR language support'] },
  { id: 'PREMIUM', name: 'Premium', price: 10, icon: Zap, color: 'yellow', features: ['Everything in Free', 'Unlimited recipes', 'Advanced macro tracking', 'Workout logging + categories', 'Weight/height tracking', 'Progress graphs', 'Editable nutrition goals', 'Health app integrations (Strava, Google Fit)', 'Workout scheduling calendar', 'Check-off completed workouts', 'AI workout suggestions'] },
  { id: 'PREMIUM_PLUS', name: 'Premium Plus', price: 20, icon: Crown, color: 'purple', features: ['Everything in Premium', 'Health recommendations engine', 'Disease library with dietary advice', 'Progress photo uploads', 'BMI calculation', 'Average calorie graphs', 'Comprehensive analytics', 'Group challenges', 'Community groups by fitness goal', 'Public & private groups with invite codes'] },
];

export default function Subscription() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(null);

  const { data: status } = useQuery('sub-status', () => api.get('/subscription/status').then(r => r.data));

  const handleUpgrade = async (planId) => {
    setLoading(planId);
    try {
      const { data } = await api.post('/subscription/checkout', { plan: planId });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading('portal');
    try {
      const { data } = await api.post('/subscription/portal');
      window.location.href = data.url;
    } catch (err) {
      toast.error('Failed to open billing portal');
    } finally {
      setLoading(null);
    }
  };

  const currentTier = user?.subscription || 'FREE';

  const colorMap = { gray: { border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', btn: '' }, yellow: { border: 'border-yellow-300 dark:border-yellow-700', badge: 'bg-yellow-100 text-yellow-700', btn: 'bg-yellow-500 hover:bg-yellow-600' }, purple: { border: 'border-purple-300 dark:border-purple-700', badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-500 hover:bg-purple-600' } };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="page-title">Choose Your Plan</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Upgrade anytime · Cancel anytime · No hidden fees</p>
      </div>

      {(currentTier === 'PREMIUM' || currentTier === 'PREMIUM_PLUS') && (
        <div className="card bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Current plan: <span className="text-primary-600">{currentTier.replace('_', ' ')}</span></p>
              {status?.subscriptionEnd && <p className="text-sm text-gray-500 mt-1">Renews: {new Date(status.subscriptionEnd).toLocaleDateString()}</p>}
            </div>
            <button onClick={handlePortal} disabled={loading === 'portal'} className="btn-secondary">
              {loading === 'portal' ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_CONFIGS.map(plan => {
          const isCurrent = currentTier === plan.id;
          const Icon = plan.icon;
          const colors = colorMap[plan.color];
          return (
            <div key={plan.id} className={`card border-2 transition-all hover:shadow-lg ${isCurrent ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900' : colors.border}`}>
              {isCurrent && <div className="-mt-2 mb-4 text-center"><span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">Current Plan</span></div>}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${colors.badge}`}><Icon size={22} /></div>
                <div><h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3><p className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price === 0 ? 'Free' : `$${plan.price}`}<span className="text-sm font-normal text-gray-400">{plan.price > 0 ? '/mo' : ''}</span></p></div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button disabled className="w-full py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-400 font-medium cursor-not-allowed">Current Plan</button>
              ) : plan.price === 0 ? (
                <button disabled className="w-full py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-400 font-medium">Downgrade</button>
              ) : (
                <button onClick={() => handleUpgrade(plan.id)} disabled={loading === plan.id} className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${colors.btn} disabled:opacity-50`}>
                  {loading === plan.id ? 'Loading...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
