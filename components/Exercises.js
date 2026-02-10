
import React, { useState, useMemo } from 'react';
import htm from 'htm';
import { Plus, Edit2, Trash2, Check, X, Search, ChevronRight, TrendingUp, Calendar, Target, Activity, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const html = htm.bind(React.createElement);

const CATEGORIES = ['Brust', 'Rücken', 'Beine', 'Arme', 'Bauch', 'Schultern'];

const ExerciseDetail = ({ exercise, history, onClose }) => {
  const exerciseHistory = useMemo(() => {
    const data = [];
    history.forEach(workout => {
      const exEntry = workout.exercises.find(e => e.exerciseId === exercise.id);
      if (exEntry) {
        exEntry.sets.forEach((set, setIdx) => {
          data.push({
            date: workout.date,
            formattedDate: new Date(workout.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            weight: set.weight,
            reps: set.reps,
            rir: set.rir || 0,
            volume: set.weight * set.reps,
            setIndex: setIdx + 1,
            note: set.note || ''
          });
        });
      }
    });
    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [exercise.id, history]);

  const stats = useMemo(() => {
    if (exerciseHistory.length === 0) return null;
    const maxWeight = Math.max(...exerciseHistory.map(h => h.weight));
    const totalVolume = exerciseHistory.reduce((acc, h) => acc + h.volume, 0);
    const bestSet = exerciseHistory.reduce((prev, curr) => (curr.weight > prev.weight) ? curr : prev, exerciseHistory[0]);
    const est1RM = bestSet.weight * (1 + (bestSet.reps / 30));
    
    // Group by date for chart
    const dailyData = [];
    const grouped = exerciseHistory.reduce((acc, h) => {
      if (!acc[h.date]) acc[h.date] = [];
      acc[h.date].push(h);
      return acc;
    }, {});

    Object.keys(grouped).forEach(date => {
      const daySets = grouped[date];
      dailyData.push({
        date,
        formattedDate: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        avgWeight: daySets.reduce((a, b) => a + b.weight, 0) / daySets.length,
        maxWeight: Math.max(...daySets.map(s => s.weight)),
        maxReps: Math.max(...daySets.map(s => s.reps)),
        avgRIR: daySets.reduce((a, b) => a + (b.rir || 0), 0) / daySets.length,
        totalVolume: daySets.reduce((a, b) => a + b.volume, 0)
      });
    });

    return { maxWeight, totalVolume, est1RM: est1RM.toFixed(1), dailyData: dailyData.sort((a,b) => new Date(a.date) - new Date(b.date)) };
  }, [exerciseHistory]);

  return html`
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col pt-safe animate-in slide-in-from-right duration-300">
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-white truncate max-w-[200px]">${exercise.name}</h2>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">${exercise.category}</span>
        </div>
        <button onClick=${onClose} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 active:scale-95 transition-all">
          <${X} size=${24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-12">
        ${!stats ? html`
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
              <${Activity} size=${40} className="opacity-20" />
            </div>
            <p className="font-bold text-sm uppercase tracking-widest">Noch keine Daten verfügbar</p>
          </div>
        ` : html`
          <!-- QUICK STATS -->
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-900 p-5 rounded-[28px] border border-slate-800 shadow-lg">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><${Target} size=${10} className="text-emerald-500" /> Max Weight</div>
                <div className="text-2xl font-black text-white">${stats.maxWeight} <span className="text-xs text-slate-500">kg</span></div>
             </div>
             <div className="bg-slate-900 p-5 rounded-[28px] border border-slate-800 shadow-lg">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><${TrendingUp} size=${10} className="text-indigo-500" /> Est. 1RM</div>
                <div className="text-2xl font-black text-white">${stats.est1RM} <span className="text-xs text-slate-500">kg</span></div>
             </div>
          </div>

          <!-- CHART CARD -->
          <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Fortschritt</h3>
              <div className="flex gap-2 text-[8px] font-bold uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gewicht</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Reps</span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <${ResponsiveContainer} width="100%" height="100%">
                <${AreaChart} data=${stats.dailyData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <${CartesianGrid} strokeDasharray="3 3" stroke="#1e293b" vertical=${false} />
                  <${XAxis} dataKey="formattedDate" axisLine=${false} tickLine=${false} tick=${{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                  <${YAxis} yAxisId="left" hide domain=${['dataMin - 5', 'dataMax + 5']} />
                  <${YAxis} yAxisId="right" hide orientation="right" domain=${[0, 'dataMax + 2']} />
                  <${Tooltip} 
                    contentStyle=${{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px'}}
                    itemStyle=${{fontWeight: 'bold'}}
                  />
                  <${Area} yAxisId="left" type="monotone" dataKey="maxWeight" stroke="#10b981" strokeWidth=${3} fillOpacity={1} fill="url(#colorWeight)" animationDuration=${1000} />
                  <${Area} yAxisId="right" type="monotone" dataKey="maxReps" stroke="#6366f1" strokeWidth=${2} fillOpacity={1} fill="url(#colorReps)" strokeDasharray="5 5" />
                <//>
              <//>
            </div>
          </div>

          <!-- HISTORY TABLE -->
          <section className="space-y-3">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Satz-Historie</h3>
             <div className="bg-slate-900 rounded-[28px] border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
                ${[...exerciseHistory].reverse().map((h, i) => html`
                  <div key=${i} className="p-4 space-y-2 group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-slate-950 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">S${h.setIndex}</span>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">${new Date(h.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                           <span className="text-sm font-black text-white">${h.weight} kg x ${h.reps}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-600 uppercase block">RIR</span>
                          <span className=${`text-xs font-bold ${h.rir === 0 ? 'text-red-400' : 'text-emerald-400'}`}>${h.rir}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-[9px] font-black text-slate-600 uppercase block">Volume</span>
                           <span className="text-xs font-bold text-indigo-400">${h.volume}</span>
                        </div>
                      </div>
                    </div>
                    ${h.note && html`
                      <div className="bg-slate-950/50 p-2 rounded-xl text-[10px] text-slate-400 italic border-l-2 border-indigo-500/50">
                        "${h.note}"
                      </div>
                    `}
                  </div>
                `)}
             </div>
          </section>
        `}
      </main>
    </div>
  `;
};

export const Exercises = ({ exercises, history, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedExForDetail, setSelectedExForDetail] = useState(null);
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

  const handleStartEdit = (e, ex) => {
    e.stopPropagation();
    setEditingId(ex.id);
    setEditEx({ ...ex });
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
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
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold"
          />
        </div>
        <button 
          onClick=${() => setIsAdding(!isAdding)}
          className=${`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isAdding ? 'bg-red-500/20 text-red-500' : 'bg-emerald-600 text-white shadow-lg active:scale-95'}`}
        >
          ${isAdding ? html`<${X} />` : html`<${Plus} />`}
        </button>
      </div>

      ${isAdding && html`
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <h3 className="font-bold text-white uppercase tracking-widest text-xs">Neue Übung</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Name der Übung" 
              value=${newEx.name}
              onChange=${(e) => setNewEx({ ...newEx, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold"
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
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg active:scale-95 transition-all uppercase tracking-widest"
            >
              Speichern
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
                <div 
                  key=${ex.id} 
                  onClick=${() => setSelectedExForDetail(ex)}
                  className="bg-slate-900 border border-slate-800 rounded-[28px] p-5 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-lg"
                >
                  ${editingId === ex.id ? html`
                    <div className="flex-1 flex flex-col gap-2 mr-2" onClick=${e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value=${editEx.name}
                        onChange=${(e) => setEditEx({ ...editEx, name: e.target.value })}
                        className="bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-white outline-none text-sm font-bold"
                        autoFocus
                      />
                      <select 
                        value=${editEx.category}
                        onChange=${(e) => setEditEx({ ...editEx, category: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-[10px] uppercase font-bold outline-none"
                      >
                        ${CATEGORIES.map(c => html`<option key=${c} value=${c}>${c}</option>`)}
                      </select>
                    </div>
                    <div className="flex gap-1" onClick=${e => e.stopPropagation()}>
                      <button onClick=${handleSaveEdit} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center"><${Check} size=${18} /></button>
                      <button onClick=${() => setEditingId(null)} className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center"><${X} size=${18} /></button>
                    </div>
                  ` : html`
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">${ex.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">${ex.category || 'Andere'}</span>
                        <span className="text-[9px] font-bold text-indigo-400 flex items-center gap-0.5"><${TrendingUp} size=${10} /> Progress</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick=${(e) => handleStartEdit(e, ex)}
                        className="w-10 h-10 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center active:bg-slate-800"
                      >
                        <${Edit2} size=${14} />
                      </button>
                      <button 
                        onClick=${(e) => { e.stopPropagation(); onDelete(ex.id); }}
                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center active:bg-red-500/20"
                      >
                        <${Trash2} size=${14} />
                      </button>
                    </div>
                  `}
                </div>
              `)}
            </div>
          </div>
        `)}
      </div>

      ${selectedExForDetail && html`
        <${ExerciseDetail} 
          exercise=${selectedExForDetail} 
          history=${history} 
          onClose=${() => setSelectedExForDetail(null)} 
        />
      `}
    </div>
  `;
};
