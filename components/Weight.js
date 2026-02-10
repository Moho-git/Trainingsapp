
import React, { useState, useMemo } from 'react';
import htm from 'htm';
import { Scale, Plus, Trash2, Edit2, ChevronDown, ChevronUp, X, Check, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';

const html = htm.bind(React.createElement);

const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const Weight = ({ weightLogs, onAddWeight, onUpdateWeight, onDeleteWeight }) => {
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('days'); 
  const [timeRange, setTimeRange] = useState(30); 
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const weeklyStats = useMemo(() => {
    if (weightLogs.length === 0) return [];
    
    const groups = weightLogs.reduce((acc, log) => {
      const d = new Date(log.date);
      const weekKey = `${d.getFullYear()}-W${getWeekNumber(d).toString().padStart(2, '0')}`;
      if (!acc[weekKey]) acc[weekKey] = [];
      acc[weekKey].push(log.value);
      return acc;
    }, {});

    const weeks = Object.keys(groups).sort().reverse().map((key, index, arr) => {
      const values = groups[key];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { key, avg };
    });

    return weeks.map((week, i) => {
      const prevWeek = weeks[i + 1];
      let diff = null;
      let diffPct = null;
      if (prevWeek) {
        diff = week.avg - prevWeek.avg;
        diffPct = (diff / prevWeek.avg) * 100;
      }
      return { ...week, diff, diffPct };
    });
  }, [weightLogs]);

  const chartData = useMemo(() => {
    let filtered = [...weightLogs];
    if (timeRange > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - timeRange);
      filtered = filtered.filter(w => new Date(w.date) >= cutoff);
    }

    if (viewMode === 'days') {
      return filtered.map(w => ({
        label: new Date(w.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        value: w.value,
        fullDate: new Date(w.date).toLocaleDateString('de-DE')
      }));
    } else {
      const groups = filtered.reduce((acc, log) => {
        const d = new Date(log.date);
        const key = `KW ${getWeekNumber(d)}`;
        if (!acc[key]) acc[key] = { sum: 0, count: 0 };
        acc[key].sum += log.value;
        acc[key].count += 1;
        return acc;
      }, {});
      return Object.keys(groups).map(key => ({
        label: key,
        value: parseFloat((groups[key].sum / groups[key].count).toFixed(1))
      }));
    }
  }, [weightLogs, viewMode, timeRange]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput)) return;
    onAddWeight(weightInput, new Date(dateInput).toISOString());
    setWeightInput('');
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditValue(log.value.toString());
  };

  const saveEdit = (log) => {
    onUpdateWeight({ ...log, value: parseFloat(editValue) });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Diesen Gewichtseintrag wirklich löschen?")) {
      onDeleteWeight(id);
    }
  };

  return html`
    <div className="space-y-6 pb-24">
      <header>
        <h2 className="text-3xl font-black text-white tracking-tight">Körpergewicht</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Analyse & Trends</p>
      </header>

      <section className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-xl">
        <form onSubmit=${handleAddSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Datum</label>
              <input 
                type="date"
                value=${dateInput}
                onChange=${(e) => setDateInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gewicht (kg)</label>
              <input 
                type="number" 
                step="0.1"
                inputMode="decimal"
                placeholder="0.0"
                value=${weightInput}
                onChange=${(e) => setWeightInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white outline-none focus:border-emerald-500 transition-all font-black text-xl"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">
            Eintrag hinzufügen
          </button>
        </form>
      </section>

      <section className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Verlauf</h3>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button 
                onClick=${() => setViewMode('days')}
                className=${`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'days' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
              >
                Tage
              </button>
              <button 
                onClick=${() => setViewMode('weeks')}
                className=${`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'weeks' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
              >
                Wochen
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            ${[
              { l: '7T', v: 7 },
              { l: '30T', v: 30 },
              { l: '90T', v: 90 },
              { l: 'Alle', v: 0 }
            ].map(r => html`
              <button 
                key=${r.v}
                onClick=${() => setTimeRange(r.v)}
                className=${`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all shrink-0 ${timeRange === r.v ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
              >
                ${r.l}
              </button>
            `)}
          </div>
        </div>

        <div className="h-48 w-full mt-4">
          <${ResponsiveContainer} width="100%" height="100%">
            <${AreaChart} data=${chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <${CartesianGrid} strokeDasharray="3 3" stroke="#1e293b" vertical=${false} />
              <${XAxis} 
                dataKey="label" 
                axisLine=${false} 
                tickLine=${false} 
                tick=${{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                interval="preserveStartEnd"
              />
              <${YAxis} hide domain=${['dataMin - 1', 'dataMax + 1']} />
              <${Tooltip} contentStyle=${{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} itemStyle=${{ color: '#10b981', fontWeight: 'bold' }} />
              <${Area} type="monotone" dataKey="value" stroke="#10b981" strokeWidth=${3} fillOpacity={1} fill="url(#colorWeight)" animationDuration=${1000} />
            <//>
          <//>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Wochen-Durchschnitt</h3>
        <div className="space-y-3">
          ${weeklyStats.map(week => html`
            <div key=${week.key} className="bg-slate-900 border border-slate-800 p-5 rounded-[24px] flex justify-between items-center shadow-lg">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KW ${week.key.split('-W')[1]}</p>
                <p className="text-2xl font-black text-white">${week.avg.toFixed(1)} <span className="text-xs text-slate-500">kg</span></p>
              </div>
              ${week.diff !== null && html`
                <div className="text-right">
                  <p className=${`text-sm font-black flex items-center justify-end gap-1 ${week.diff >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    ${week.diff >= 0 ? html`<${ChevronUp} size=${16} />` : html`<${ChevronDown} size=${16} />`}
                    ${Math.abs(week.diff).toFixed(1)} kg
                  </p>
                  <p className=${`text-[10px] font-bold ${week.diff >= 0 ? 'text-red-400/60' : 'text-emerald-400/60'}`}>
                    ${week.diff >= 0 ? '+' : '-'}${Math.abs(week.diffPct).toFixed(1)}%
                  </p>
                </div>
              `}
            </div>
          `)}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Alle Messungen</h3>
        <div className="bg-slate-900 rounded-[28px] border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
          ${[...weightLogs].reverse().map(w => html`
            <div key=${w.id} className="p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500">
                  <${Calendar} size=${18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">${new Date(w.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
                  ${editingId === w.id ? html`
                    <input 
                      type="number" 
                      step="0.1" 
                      value=${editValue} 
                      onChange=${(e) => setEditValue(e.target.value)}
                      className="bg-slate-950 border border-emerald-500 rounded-lg px-2 py-1 text-white w-20 outline-none font-bold"
                      autoFocus
                    />
                  ` : html`
                    <p className="font-black text-white text-lg">${w.value} <span className="text-xs text-slate-500">kg</span></p>
                  `}
                </div>
              </div>
              <div className="flex gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
                ${editingId === w.id ? html`
                  <button onClick=${() => saveEdit(w)} className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl"><${Check} size=${18}/></button>
                  <button onClick=${() => setEditingId(null)} className="p-3 text-slate-500 bg-slate-800 rounded-xl"><${X} size=${18}/></button>
                ` : html`
                  <button onClick=${() => startEditing(w)} className="p-3 text-slate-500 bg-slate-800 rounded-xl active:bg-slate-700 transition-colors"><${Edit2} size=${18}/></button>
                  <button type="button" onClick=${() => handleDelete(w.id)} className="p-3 text-red-500 bg-red-500/10 rounded-xl active:bg-red-500/20 transition-colors"><${Trash2} size=${18}/></button>
                `}
              </div>
            </div>
          `)}
        </div>
      </section>

      <style>${`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  `;
};
