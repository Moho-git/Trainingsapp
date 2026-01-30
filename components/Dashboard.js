
import React, { useRef, useState } from 'react';
import htm from 'htm';
import { Play, Download, Upload, ShieldCheck, Scale, Plus } from 'lucide-react';

const html = htm.bind(React.createElement);

export const Dashboard = ({ 
  templates, 
  history, 
  onAddWeight, 
  onStartWorkout, 
  onImportHistory 
}) => {
  const fileInputRef = useRef(null);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const handleAddWeightSubmit = (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput)) return;
    onAddWeight(weightInput, new Date(dateInput).toISOString());
    setWeightInput('');
  };

  const handleExport = () => {
    const backupData = { history };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kraftlog_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return html`
    <div className="space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">KraftLog</h1>
        <p className="text-slate-400 font-medium italic">Privat. Lokal. Sicher.</p>
      </header>

      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
          <${Play} className="w-4 h-4 fill-current" /> Training starten
        </h2>
        <div className="grid grid-cols-1 gap-4">
          ${templates.map(tpl => html`
            <button
              key=${tpl.id}
              onClick=${() => onStartWorkout(tpl.id)}
              className="bg-slate-900 p-6 rounded-[28px] text-left border border-slate-800 active:bg-slate-800 active:scale-[0.98] transition-all flex justify-between items-center shadow-lg group"
            >
              <div>
                <h3 className="font-bold text-xl text-slate-100 group-active:text-emerald-400">${tpl.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-bold">${tpl.exercises.length} Übungen</p>
              </div>
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                <${Play} className="w-6 h-6 fill-current" />
              </div>
            </button>
          `)}
        </div>
      </section>

      <!-- Kurze Gewichtseingabe -->
      <section className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800 space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <${Scale} className="w-4 h-4 text-emerald-500" /> Gewicht tracken
        </h2>
        <form onSubmit=${handleAddWeightSubmit} className="space-y-3">
          <div className="flex gap-2 items-stretch">
            <input 
              type="date"
              value=${dateInput}
              onChange=${(e) => setDateInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-3 text-white outline-none focus:border-emerald-500 transition-all text-[10px] w-[30%] min-w-0"
            />
            <input 
              type="number" 
              step="0.1"
              inputMode="decimal"
              placeholder="kg"
              value=${weightInput}
              onChange=${(e) => setWeightInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm min-w-0"
            />
            <button 
              type="submit"
              className="px-4 bg-emerald-600 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg hover:bg-emerald-500 shrink-0"
            >
              <${Plus} size=${20} />
            </button>
          </div>
          <p className="text-[9px] text-slate-500 text-center italic">Für Analysen siehe den "Gewicht" Tab.</p>
        </form>
      </section>

      <section className="bg-slate-900/30 p-6 rounded-[32px] border border-slate-800/50">
        <h2 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <${ShieldCheck} className="w-4 h-4" /> Daten-Backup
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick=${handleExport} className="flex flex-col items-center p-4 bg-slate-800/40 rounded-2xl gap-2 active:bg-slate-700 border border-slate-700/50 transition-all">
            <${Download} className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400">Export</span>
          </button>
          <button onClick=${() => fileInputRef.current?.click()} className="flex flex-col items-center p-4 bg-slate-800/40 rounded-2xl gap-2 active:bg-slate-700 border border-slate-700/50 transition-all">
            <${Upload} className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400">Import</span>
          </button>
          <input type="file" ref=${fileInputRef} onChange=${(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const parsed = JSON.parse(ev.target?.result);
                  if (parsed.history) onImportHistory(parsed.history);
                } catch (err) {}
              };
              reader.readAsText(file);
          }} accept=".json" className="hidden" />
        </div>
      </section>
    </div>
  `;
};
