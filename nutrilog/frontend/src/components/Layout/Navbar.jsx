import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Sun, Moon, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const tierBadge = { FREE: 'bg-gray-100 text-gray-700', PREMIUM: 'bg-yellow-100 text-yellow-700', PREMIUM_PLUS: 'bg-purple-100 text-purple-700' };
  const tierLabel = { FREE: 'Free', PREMIUM: 'Premium', PREMIUM_PLUS: 'Premium+' };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300"><Menu size={20} /></button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="font-bold text-xl text-primary-600 dark:text-primary-400 hidden sm:block">NutriLog</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tierBadge[user?.subscription || 'FREE']}`}>{tierLabel[user?.subscription || 'FREE']}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-50">
              <Link to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Settings</Link>
              <Link to="/subscription" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Subscription</Link>
              {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Admin</Link>}
              <hr className="my-1 border-gray-100 dark:border-slate-700" />
              <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
