import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import MacroPieChart from '../components/common/MacroPieChart';
import ProgressBar from '../components/common/ProgressBar';
import { Flame, Droplets, Footprints, Dumbbell, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: summary, isLoading } = useQuery('dashboard-summary', () =>
    api.get('/analytics/summary').then(r => r.data), { refetchInterval: 60000 }
  );

  const { data: calorieHistory } = useQuery('calorie-history-7', () =>
    api.get('/analytics/calories?days=7').then(r => r.data)
  );

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const today = summary?.today || {};
  const goals = summary?.goals || {};
  const calorieNet = today.caloriesIn - today.caloriesBurned;
  const calorieGoal = goals.calories || 2000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        {!user?.emailVerified && (
          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-lg text-sm">
            <AlertCircle size={16} />
            <span>Verify your email</span>
          </div>
        )}
      </div>

      {/* Calorie Summary Card */}
      <div className="card">
        <h2 className="section-title mb-4">{t('dashboard.today')}</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[{ label: t('dashboard.caloriesIn'), value: Math.round(today.caloriesIn || 0), color: 'text-green-600' },
            { label: t('dashboard.caloriesBurned'), value: Math.round(today.caloriesBurned || 0), color: 'text-orange-500' },
            { label: t('dashboard.net'), value: Math.round(calorieNet || 0), color: calorieNet > calorieGoal ? 'text-red-500' : 'text-blue-600' }]
            .map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400">kcal</p>
              </div>
            ))}
        </div>
        <ProgressBar value={today.caloriesIn || 0} max={calorieGoal} label={`Goal: ${calorieGoal} kcal`} showPercent size="lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Protein" value={Math.round(today.protein || 0)} unit="g" icon={TrendingUp} color="blue"
          progress={today.protein || 0} goal={goals.protein || 150} />
        <StatCard title="Water" value={Math.round((today.waterMl || 0) / 1000 * 10) / 10} unit="L" icon={Droplets} color="blue"
          progress={(today.waterMl || 0) / 10} goal={(goals.waterMl || 2000) / 10} />
        <StatCard title="Steps" value={(today.steps || 0).toLocaleString()} icon={Footprints} color="orange"
          progress={today.steps || 0} goal={goals.steps || 10000} />
        <StatCard title="Workouts" value={today.workoutCount || 0} icon={Dumbbell} color="purple" />
      </div>

      {/* Macros + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Today's Macros</h3>
          <MacroPieChart protein={today.protein || 0} carbs={today.carbs || 0} fat={today.fat || 0} />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[{ label: 'Protein', value: Math.round(today.protein || 0), goal: goals.protein || 150, color: 'bg-primary-500' },
              { label: 'Carbs', value: Math.round(today.carbs || 0), goal: goals.carbs || 250, color: 'bg-blue-500' },
              { label: 'Fat', value: Math.round(today.fat || 0), goal: goals.fat || 65, color: 'bg-yellow-500' }]
              .map(({ label, value, goal, color }) => (
                <div key={label} className="text-center">
                  <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1`} />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}g</p>
                  <p className="text-xs text-gray-400">/ {goal}g {label}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-4">7-Day Calorie Trend</h3>
          {calorieHistory?.data?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={calorieHistory.data}>
                <defs><linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={d => format(new Date(d), 'MM/dd')} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`${v} kcal`, 'Calories']} labelFormatter={d => format(new Date(d), 'MMM d')} />
                <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} fill="url(#calGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Log food to see your trend</div>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="section-title mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ to: '/food', icon: '🍽️', label: 'Log Food' }, { to: '/water', icon: '💧', label: 'Log Water' },
            { to: '/steps', icon: '👟', label: 'Log Steps' }, { to: '/workouts', icon: '💪', label: 'Log Workout' }]
            .map(({ to, icon, label }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};
