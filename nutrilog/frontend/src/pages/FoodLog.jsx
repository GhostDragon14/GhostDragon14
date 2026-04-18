import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { Search, Plus, Trash2, Camera, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const MEALS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
const MEAL_ICONS = { BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '🍎' };

export default function FoodLog() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showSearch, setShowSearch] = useState(false);
  const [activeMeal, setActiveMeal] = useState('BREAKFAST');
  const [searchQ, setSearchQ] = useState('');
  const [searchSource, setSearchSource] = useState('nutritionix');
  const [selectedFood, setSelectedFood] = useState(null);
  const [logForm, setLogForm] = useState({ serving: 1, mealType: 'BREAKFAST' });
  const [barcodeMode, setBarcodeMode] = useState(false);

  const { data: dayLog, isLoading } = useQuery(['food-log', date], () =>
    api.get(`/food/log?date=${date}`).then(r => r.data)
  );

  const { data: searchResults, isFetching: searching } = useQuery(
    ['food-search', searchQ, searchSource],
    () => api.get(`/food/search?q=${encodeURIComponent(searchQ)}&source=${searchSource}`).then(r => r.data),
    { enabled: searchQ.length >= 2 }
  );

  const logMutation = useMutation(
    (data) => api.post('/food/log', data),
    { onSuccess: () => { qc.invalidateQueries(['food-log', date]); qc.invalidateQueries('dashboard-summary'); setShowSearch(false); setSelectedFood(null); toast.success('Food logged!'); } }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/food/log/${id}`),
    { onSuccess: () => { qc.invalidateQueries(['food-log', date]); qc.invalidateQueries('dashboard-summary'); toast.success('Deleted'); } }
  );

  const handleAddFood = (food) => {
    setSelectedFood(food);
    setLogForm({ serving: food.serving || 1, mealType: activeMeal });
  };

  const handleLogSubmit = () => {
    if (!selectedFood) return;
    const mult = logForm.serving / (selectedFood.serving || 1);
    logMutation.mutate({
      foodName: selectedFood.name, brandName: selectedFood.brand,
      calories: Math.round(selectedFood.calories * mult),
      protein: Math.round((selectedFood.protein || 0) * mult * 10) / 10,
      carbs: Math.round((selectedFood.carbs || 0) * mult * 10) / 10,
      fat: Math.round((selectedFood.fat || 0) * mult * 10) / 10,
      fiber: Math.round((selectedFood.fiber || 0) * mult * 10) / 10,
      sodium: Math.round((selectedFood.sodium || 0) * mult * 10) / 10,
      serving: logForm.serving, servingUnit: selectedFood.servingUnit || 'serving',
      mealType: logForm.mealType, date, source: selectedFood.source || 'manual',
    });
  };

  const totals = dayLog?.totals || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('food.title')}</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-auto text-sm" />
          <button onClick={() => setShowSearch(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('food.add')}
          </button>
        </div>
      </div>

      {/* Daily Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: 'Calories', value: Math.round(totals.calories || 0), unit: 'kcal' },
          { label: 'Protein', value: Math.round(totals.protein || 0), unit: 'g' },
          { label: 'Carbs', value: Math.round(totals.carbs || 0), unit: 'g' },
          { label: 'Fat', value: Math.round(totals.fat || 0), unit: 'g' }]
          .map(({ label, value, unit }) => (
            <div key={label} className="card text-center py-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{label} ({unit})</p>
            </div>
          ))}
      </div>

      {/* Meals */}
      {MEALS.map(meal => {
        const mealLogs = dayLog?.byMeal?.[meal] || [];
        const mealCals = mealLogs.reduce((s, l) => s + l.calories, 0);
        return (
          <div key={meal} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{MEAL_ICONS[meal]}</span>
                <h3 className="section-title">{t(`food.${meal.toLowerCase()}`)}</h3>
                <span className="text-sm text-gray-400">· {Math.round(mealCals)} kcal</span>
              </div>
              <button onClick={() => { setActiveMeal(meal); setShowSearch(true); }}
                className="text-primary-500 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20">
                <Plus size={18} />
              </button>
            </div>
            {mealLogs.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-3">Nothing logged yet</p>
            ) : (
              <div className="space-y-2">
                {mealLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.foodName}</p>
                      <p className="text-xs text-gray-400">{log.brandName && `${log.brandName} · `}{log.serving} {log.servingUnit}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">P: {Math.round(log.protein)}g · C: {Math.round(log.carbs)}g · F: {Math.round(log.fat)}g</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right">{Math.round(log.calories)} kcal</p>
                      <button onClick={() => deleteMutation.mutate(log.id)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Food Search Modal */}
      <Modal open={showSearch} onClose={() => { setShowSearch(false); setSelectedFood(null); setSearchQ(''); }} title="Add Food" size="lg">
        {!selectedFood ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} className="input pl-9" placeholder={t('food.search')} />
              </div>
              <select value={searchSource} onChange={e => setSearchSource(e.target.value)} className="input w-auto">
                <option value="nutritionix">Nutritionix</option>
                <option value="usda">USDA</option>
              </select>
            </div>
            <div className="flex gap-2">
              {MEALS.map(m => (
                <button key={m} onClick={() => setLogForm(f => ({ ...f, mealType: m }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    logForm.mealType === m ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                  }`}>{MEAL_ICONS[m]} {t(`food.${m.toLowerCase()}`)}</button>
              ))}
            </div>
            {searching && <div className="text-center text-gray-400 text-sm py-4">Searching...</div>}
            {searchResults && (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {searchResults.map((food, i) => (
                  <button key={i} onClick={() => handleAddFood(food)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{food.name}</p>
                        {food.brand && <p className="text-xs text-gray-400">{food.brand}</p>}
                      </div>
                      {food.calories ? <p className="text-sm font-semibold text-primary-600">{Math.round(food.calories)} kcal</p> : <p className="text-xs text-gray-400">Click for details</p>}
                    </div>
                  </button>
                ))}
                {searchResults.length === 0 && searchQ.length >= 2 && !searching && <p className="text-center text-gray-400 text-sm py-4">{t('food.noResults')}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setSelectedFood(null)} className="text-sm text-primary-600 hover:underline">← Back to search</button>
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedFood.name}</h3>
              {selectedFood.brand && <p className="text-sm text-gray-500">{selectedFood.brand}</p>}
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {[{ label: 'Calories', value: Math.round(selectedFood.calories || 0) }, { label: 'Protein', value: `${Math.round(selectedFood.protein || 0)}g` }, { label: 'Carbs', value: `${Math.round(selectedFood.carbs || 0)}g` }, { label: 'Fat', value: `${Math.round(selectedFood.fat || 0)}g` }]
                  .map(({ label, value }) => (<div key={label}><p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p><p className="text-xs text-gray-400">{label}</p></div>))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Serving Amount</label>
                <input type="number" min="0.1" step="0.1" value={logForm.serving} onChange={e => setLogForm(f => ({ ...f, serving: parseFloat(e.target.value) || 1 }))} className="input" />
              </div>
              <div>
                <label className="label">Meal</label>
                <select value={logForm.mealType} onChange={e => setLogForm(f => ({ ...f, mealType: e.target.value }))} className="input">
                  {MEALS.map(m => <option key={m} value={m}>{t(`food.${m.toLowerCase()}`)}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleLogSubmit} disabled={logMutation.isLoading} className="btn-primary w-full py-3">
              {logMutation.isLoading ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
