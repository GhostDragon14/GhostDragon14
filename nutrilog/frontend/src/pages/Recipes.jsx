import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { Plus, Search, Trash2, Edit2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Recipes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const isPremium = user?.subscription !== 'FREE';

  const { data, isLoading } = useQuery(['recipes', search], () =>
    api.get(`/recipes?search=${search}`).then(r => r.data)
  );

  const [form, setForm] = useState({ name: '', description: '', servings: 1, instructions: '', isPublic: false, ingredients: [{ name: '', amount: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '' }] });

  const createMutation = useMutation(
    (data) => api.post('/recipes', data),
    { onSuccess: () => { qc.invalidateQueries('recipes'); setShowModal(false); resetForm(); toast.success('Recipe created!'); },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to create recipe') }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/recipes/${id}`),
    { onSuccess: () => { qc.invalidateQueries('recipes'); toast.success('Deleted'); } }
  );

  const resetForm = () => setForm({ name: '', description: '', servings: 1, instructions: '', isPublic: false, ingredients: [{ name: '', amount: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '' }] });

  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', amount: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '' }] }));
  const removeIngredient = (i) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));
  const updateIngredient = (i, field, value) => setForm(f => { const ingredients = [...f.ingredients]; ingredients[i] = { ...ingredients[i], [field]: value }; return { ...f, ingredients }; });

  const totalCals = form.ingredients.reduce((s, i) => s + (parseFloat(i.calories) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Recipes</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Recipe
        </button>
      </div>

      {!isPremium && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3">
          <Lock size={16} className="text-yellow-600" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Free plan: 2 recipes/week. <a href="/subscription" className="font-semibold underline">Upgrade for unlimited recipes</a></p>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search recipes..." />
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.recipes || []).map(recipe => (
            <div key={recipe.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{recipe.name}</h3>
                <button onClick={() => deleteMutation.mutate(recipe.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
              </div>
              {recipe.description && <p className="text-sm text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">{recipe.description}</p>}
              <div className="grid grid-cols-4 gap-2 text-center border-t border-gray-100 dark:border-slate-700 pt-3">
                {[{ l: 'Cal', v: Math.round(recipe.calories) }, { l: 'P', v: `${Math.round(recipe.protein)}g` }, { l: 'C', v: `${Math.round(recipe.carbs)}g` }, { l: 'F', v: `${Math.round(recipe.fat)}g` }]
                  .map(({ l, v }) => (<div key={l}><p className="text-sm font-semibold text-gray-900 dark:text-white">{v}</p><p className="text-xs text-gray-400">{l}</p></div>))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{recipe.ingredients?.length} ingredients · {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</p>
            </div>
          ))}
          {(data?.recipes || []).length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No recipes yet. Create your first!</div>}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Create Recipe" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Recipe Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="E.g. Chicken Rice Bowl" />
            </div>
            <div>
              <label className="label">Servings</label>
              <input type="number" min="1" value={form.servings} onChange={e => setForm(f => ({ ...f, servings: parseInt(e.target.value) || 1 }))} className="input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Make public</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Ingredients *</label>
              <button type="button" onClick={addIngredient} className="text-primary-500 text-sm hover:underline">+ Add</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-8 gap-2 items-center">
                  <input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} className="input col-span-2 text-sm" placeholder="Name" />
                  <input type="number" value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} className="input text-sm" placeholder="Amt" />
                  <input value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} className="input text-sm" placeholder="Unit" />
                  <input type="number" value={ing.calories} onChange={e => updateIngredient(i, 'calories', e.target.value)} className="input text-sm" placeholder="Cal" />
                  <input type="number" value={ing.protein} onChange={e => updateIngredient(i, 'protein', e.target.value)} className="input text-sm" placeholder="P" />
                  <input type="number" value={ing.carbs} onChange={e => updateIngredient(i, 'carbs', e.target.value)} className="input text-sm" placeholder="C" />
                  <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">Total: <strong>{Math.round(totalCals)}</strong> calories</div>
          </div>

          <div>
            <label className="label">Instructions (optional)</label>
            <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} className="input" rows={3} placeholder="Step-by-step instructions..." />
          </div>
          <button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.ingredients.some(i => i.name) || createMutation.isLoading} className="btn-primary w-full py-3">
            {createMutation.isLoading ? 'Creating...' : 'Create Recipe'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
