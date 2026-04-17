import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, UtensilsCrossed, BookOpen, Dumbbell, Droplets, Footprints, Scale, BarChart3, Users, Settings, CreditCard, Shield, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', tier: 'FREE' },
  { to: '/food', icon: UtensilsCrossed, labelKey: 'nav.food', tier: 'FREE' },
  { to: '/recipes', icon: BookOpen, labelKey: 'nav.recipes', tier: 'FREE' },
  { to: '/water', icon: Droplets, labelKey: 'nav.water', tier: 'FREE' },
  { to: '/steps', icon: Footprints, labelKey: 'nav.steps', tier: 'FREE' },
  { to: '/workouts', icon: Dumbbell, labelKey: 'nav.workouts', tier: 'PREMIUM' },
  { to: '/weight', icon: Scale, labelKey: 'nav.weight', tier: 'PREMIUM' },
  { to: '/analytics', icon: BarChart3, labelKey: 'nav.analytics', tier: 'FREE' },
  { to: '/groups', icon: Users, labelKey: 'nav.groups', tier: 'PREMIUM_PLUS' },
];

const TIER_ORDER = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];

const hasTierAccess = (userTier, requiredTier) => {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const tierBadge = (tier) => {
    if (tier === 'PREMIUM') return <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded-full ml-auto">PRO</span>;
    if (tier === 'PREMIUM_PLUS') return <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-full ml-auto">PLUS</span>;
    return null;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
      <div className="p-5 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span className="font-bold text-xl text-primary-600 dark:text-primary-400">NutriLog</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey, tier }) => {
          const accessible = hasTierAccess(user?.subscription || 'FREE', tier);
          return (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' :
                  accessible ? 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white' :
                  'text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                }`
              }>
              <Icon size={18} />
              <span>{t(labelKey)}</span>
              {tierBadge(accessible ? null : tier)}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-200 dark:border-slate-700 space-y-0.5">
        <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
          <Settings size={18} /><span>{t('nav.settings')}</span>
        </NavLink>
        <NavLink to="/subscription" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
          <CreditCard size={18} /><span>{t('nav.subscription')}</span>
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
            <Shield size={18} /><span>{t('nav.admin')}</span>
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
