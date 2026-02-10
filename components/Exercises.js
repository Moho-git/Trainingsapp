
import React, { useState, useMemo, useEffect } from 'react';
import htm from 'htm';
import { Plus, Edit2, Trash2, Check, X, Search, TrendingUp, Calendar, Target, Activity, ListFilter, Award, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

const html = htm.bind(React.createElement);

const CATEGORIES = ['Brust', 'Rücken', 'Beine', 'Arme', 'Bauch', 'Schultern'];

const ExerciseDetail = ({ exercise, history, onClose }) => {
  // Listen for popstate to close detail view via back button
  useEffect(() => {
    const handleBack = () => onClose();
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, [onClose]);

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
    
    // Group by date to find peak performance per session
    const dailyData = [];
    const groupedByDate = exerciseHistory.reduce((acc, h) => {
      if (!acc[h.date]) acc[h.date] = [];
      acc[h.date].push(h);
      return acc;
    }, {});

    Object.keys(groupedByDate).forEach(date => {
      const daySets = groupedByDate[date];
      
      // PEAK SET: Set with highest weight. If weight is same, set with more reps.
      const peakSet = daySets.reduce((prev, curr) => {
        if (curr.weight > prev.weight) return curr;
        if (curr.weight === prev.weight && curr.reps > prev.reps) return curr;
        return prev;
      }, daySets[0]);

      dailyData.push({
        date,
        formattedDate: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        peakWeight: peakSet.weight,
        peakReps: peakSet.reps,
        avgRIR: daySets.reduce((a, b) => a + (b.rir || 0), 0) / daySets.length
      });
    });

    // ALL-TIME BEST (Peak weight and the reps it was achieved with)
    const allTimeBest = dailyData.reduce((prev, curr) => {
      if (curr.peakWeight > prev.peakWeight) return curr;
      if (curr.peakWeight === prev.peakWeight && curr.peakReps > prev.peakReps) return curr;
      return prev;
    }, dailyData[0]);

    // EST 1RM (calculated from the all-time best weight/reps)
    const est1RM = allTimeBest.peakWeight * (1 + (allTimeBest.peakReps / 30));

    return { 
      allTimeBest,
      est1RM: est1RM.toFixed(1), 
      dailyData: dailyData.sort((a,b) => new Date(a.date) - new Date(b.date)),
      groupedByDate
    };
  }, [exerciseHistory]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return html`
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">${label}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 font-bold text-sm">Gewicht: ${payload[0].value} kg</p>
            <p className="text-indigo-400 font-bold text-sm">WDH: ${payload[1].value}</p>
          </div>
        </div>
      `;
    }
    return null;
  };

  return html`
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col pt-safe animate-in slide-in-from-right duration-300">
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-white truncate max-w-[200px]">${exercise.name}</h2>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">${exercise.category}</span>
        </div>
        <button onClick=${() => { window.history.back(); }} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 active:scale-95 transition-all">
          <${X} size=${24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        ${!stats ? html`
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
              <${Activity} size=${40} className="opacity-20" />
            </div>
            <p className="font-bold text-sm uppercase tracking-widest">Keine Daten vorhanden</p>
          </div>
        ` : html`
          <!-- BESTLEISTUNG HIGHLIGHT -->
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10"><${Award} size=${120} /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1 flex items-center gap-1">
                <${Zap} size=${10} /> Bisherige Bestleistung
              </p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-5xl font-black text-white">${stats.allTimeBest.peakWeight}</h1>
                <span className="text-emerald-100 font-black text-xl">kg</span>
                <span className="text-emerald-100 font-bold text-sm ml-2">@ ${stats.allTimeBest.peakReps} Reps</span>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[9px] font-black text-emerald-50 uppercase mr-1">Est. 1RM</span>
                  <span className="text-xs font-black text-white">${stats.est1RM}kg</span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[9px] font-black text-emerald-50 uppercase mr-1">Datum</span>
                  <span className="text-xs font-black text-white">${new Date(stats.allTimeBest.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CHART: Peak Performance -->
          <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest">Progress-Chart</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Stärkster Satz pro Session</p>
              </div>
              <div className="flex gap-3 text-[8px] font-black uppercase tracking-tighter">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> KG</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> REPS</span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <${ResponsiveContainer} width="100%" height="100%">
                <${ComposedChart} data=${stats.dailyData}>
                  <defs>
                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <${CartesianGrid} strokeDasharray="3 3" stroke="#1e293b" vertical=${false} />
                  <${XAxis} dataKey="formattedDate" axisLine=${false} tickLine=${false} tick=${{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                  <${YAxis} yAxisId="left" hide domain=${['dataMin - 10', 'dataMax + 10']} />
                  <${YAxis} yAxisId="right" hide orientation="right" domain=${[0, 'dataMax + 5']} />
                  <${Tooltip} content=${html`<${CustomTooltip} />`} />
                  <${Area} yAxisId="left" type="monotone" dataKey="peakWeight" stroke="#10b981" strokeWidth=${4} fillOpacity={1} fill="url(#colorPeak)" animationDuration=${800} />
                  <${Bar} yAxisId="right" dataKey="peakReps" fill="#6366f1" radius=${[4, 4, 0, 0]} barSize=${16} opacity=${0.6} animationDuration=${1000} />
                <//>
              <//>
            </div>
          </div>

          <!-- SESSION HISTORY WITH ALIGNED SET COMPARISON -->
          <section className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Session Vergleich</h3>
                <${ListFilter} size=${14} className="text-slate-600" />
             </div>
             
             <div className="space-y-4">
                ${Object.keys(stats.groupedByDate).sort((a,b) => new Date(b) - new Date(a)).map(date => {
                  const daySets = stats.groupedByDate[date];
                  return html`
                    <div key=${date} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-lg">
                      <div className="px-5 py-3 bg-slate-800/20 border-b border-slate-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">${new Date(date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-right">
                              <p className="text-[8px] font-black text-slate-600 uppercase">Sätze</p>
                              <p className="text-[10px] font-bold text-white">${daySets.length}</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-slate-800/20">
                        ${daySets.map((s, idx) => html`
                          <div key=${idx} className="p-3 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-800/50">S${s.setIndex}</span>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white">${s.weight} <span className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">kg</span></span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                               <div className="text-center w-8">
                                  <span className="text-[8px] font-black text-slate-600 uppercase block">WDH</span>
                                  <span className="text-sm font-black text-indigo-400">${s.reps}</span>
                               </div>
                               <div className="text-center w-6">
                                  <span className="text-[8px] font-black text-slate-600 uppercase block">RIR</span>
                                  <span className=${`text-sm font-black ${s.rir === 0 ? 'text-red-400' : 'text-emerald-400'}`}>${s.rir}</span>
                               </div>
                            </div>
                          </div>
                          ${s.note && html`
                            <div className="px-14 pb-3 -mt-1">
                               <p className="text-[9px] text-slate-500 italic border-l border-emerald-500/30 pl-2">"${s.note}"</p>
                            </div>
                          `}
                        `)}
                      </div>
                    </div>
                  `;
                })}
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
                  onClick=${() => {
                    setSelectedExForDetail(ex);
                    window.history.pushState({ view: 'exercise-detail' }, '');
                  }}
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
