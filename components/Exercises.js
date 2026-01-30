
import React, { useState } from 'react';
import htm from 'htm';
import { Plus, Edit2, Trash2, Check, X, Search, ChevronDown, ChevronRight } from 'lucide-react';

const html = htm.bind(React.createElement);

const CATEGORIES = [
  'Brust', 'Rücken', 'Beine', 'Arme', 'Bauch'
];

export const Exercises = ({ exercises, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEx, setNewEx] = useState({ name: '', category: 'Brust' });
  const [editEx, setEditEx] = useState({ name: '', category: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filteredExercises.reduce((acc, ex) => {
    const cat = ex.category || 'Andere';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort();

  const handleStartEdit = (ex) => {
    setEditingId(ex.id);
    setEditEx({ ...ex });
  };

  const handleSaveEdit = () => {
    if (!editEx.name.trim()) return;
    onUpdate(editEx);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newEx.name.trim()) return;
    onAdd(newEx);
    setNewEx({ name: '', category: 'Brust' });
    setIsAdding(false);
  };

  return html`
    <div className="space-y-6 pb-24">
      <header className="mb-6">
        <h2 className="text-3xl font-black text-white tracking-tight">Übungen</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Bibliothek verwalten</p>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <${Search} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size=${18} />
          <input 
            type="text" 
            placeholder="Übung suchen..." 
            value=${searchTerm}
            onChange=${(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <button 
          onClick=${() => setIsAdding(!isAdding)}
          className=${`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isAdding ? 'bg-red-500/20 text-red-500' : 'bg-emerald-600 text-white'}`}
        >
          ${isAdding ? html`<${X} />` : html`<${Plus} />`}
        </button>
      </div>

      ${isAdding && html`
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-white">Neue Übung</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Name der Übung" 
              value=${newEx.name}
              onChange=${(e) => setNewEx({ ...newEx, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
            <div className="flex flex-wrap gap-2">
              ${CATEGORIES.map(cat => html`
                <button 
                  key=${cat}
                  onClick=${() => setNewEx({ ...newEx, category: cat })}
                  className=${`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${newEx.category === cat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  ${cat}
                </button>
              `)}
            </div>
            <button 
              onClick=${handleAdd}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold active:scale-95 transition-all"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      `}

      <div className="space-y-8">
        ${sortedCategories.map(category => html`
          <div key=${category} className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              ${category}
            </div>
            <div className="space-y-2">
              ${grouped[category].map(ex => html`
                <div key=${ex.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group">
                  ${editingId === ex.id ? html`
                    <div className="flex-1 flex flex-col gap-2 mr-2">
                      <input 
                        type="text" 
                        value=${editEx.name}
                        onChange=${(e) => setEditEx({ ...editEx, name: e.target.value })}
                        className="bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-white outline-none text-sm"
                        autoFocus
                      />
                      <select 
                        value=${editEx.category}
                        onChange=${(e) => setEditEx({ ...editEx, category: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs outline-none"
                      >
                        ${CATEGORIES.map(c => html`<option key=${c} value=${c}>${c}</option>`)}
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button onClick=${handleSaveEdit} className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center"><${Check} size=${18} /></button>
                      <button onClick=${() => setEditingId(null)} className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center"><${X} size=${18} /></button>
                    </div>
                  ` : html`
                    <div>
                      <h4 className="font-bold text-slate-100">${ex.name}</h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">${ex.category || 'Andere'}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick=${() => handleStartEdit(ex)}
                        className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center active:bg-slate-700"
                      >
                        <${Edit2} size=${16} />
                      </button>
                      <button 
                        onClick=${() => onDelete(ex.id)}
                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center active:bg-red-500/20"
                      >
                        <${Trash2} size=${16} />
                      </button>
                    </div>
                  `}
                </div>
              `)}
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
};
