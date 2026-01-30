
import React, { useRef, useState } from 'react';
import { CompletedWorkout, WorkoutTemplate } from '../types';
import { Play, TrendingUp, Download, Upload, ShieldCheck, Smartphone, ChevronRight, Share, MoreVertical, Github } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  templates: WorkoutTemplate[];
  history: CompletedWorkout[];
  onStartWorkout: (templateId: string) => void;
  onNavigateToHistory: () => void;
  onImportHistory: (data: CompletedWorkout[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  templates, 
  history, 
  onStartWorkout,
  onNavigateToHistory,
  onImportHistory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSetup, setShowSetup] = useState(false);

  const chartData = history.slice(0, 7).reverse().map(h => ({
    name: new Date(h.date).toLocaleDateString('de-DE', { weekday: 'short' }),
    sets: h.exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
  }));

  const handleExport = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kraftlog_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">KraftLog</h1>
        <p className="text-slate-400 font-medium italic">Privat. Lokal. Sicher.</p>
      </header>

      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
          <Play className="w-4 h-4 fill-current" /> Training starten
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => onStartWorkout(tpl.id)}
              className="bg-slate-900 p-6 rounded-[28px] text-left border border-slate-800 active:bg-slate-800 active:scale-[0.98] transition-all flex justify-between items-center shadow-lg group"
            >
              <div>
                <h3 className="font-bold text-xl text-slate-100 group-active:text-emerald-400">{tpl.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-bold">{tpl.exercises.length} Übungen</p>
              </div>
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-indigo-950/30 p-6 rounded-[32px] border border-indigo-500/30 shadow-xl">
        <button onClick={() => setShowSetup(!showSetup)} className="w-full flex items-center justify-between text-indigo-400">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Als App installieren</h2>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${showSetup ? 'rotate-90' : ''}`} />
        </button>
        
        {showSetup && (
          <div className="mt-6 space-y-4 animate-setup">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Share size={20}/></div>
                <div>
                  <p className="text-white font-bold text-xs">iPhone (Safari)</p>
                  <p className="text-[10px] text-slate-400">Teilen-Button drücken -> "Zum Home-Bildschirm"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><MoreVertical size={20}/></div>
                <div>
                  <p className="text-white font-bold text-xs">Android (Chrome)</p>
                  <p className="text-[10px] text-slate-400">Drei Punkte oben rechts -> "App installieren"</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center text-[10px] text-indigo-300/50 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
              <Github size={12} />
              <p>Gehostet via GitHub Pages (Privat-Daten bleiben lokal)</p>
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aktivität</h2>
            <button onClick={onNavigateToHistory} className="text-xs text-blue-400 font-bold px-3 py-1.5 bg-blue-400/10 rounded-full">Details</button>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide />
                <Bar dataKey="sets">
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#10b981" : "#1e293b"} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="bg-slate-900/30 p-6 rounded-[32px] border border-slate-800/50">
        <h2 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Daten-Backup
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleExport} className="flex flex-col items-center p-4 bg-slate-800/40 rounded-2xl gap-2 active:bg-slate-700 transition-colors border border-slate-700/50">
            <Download className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400">Export</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-4 bg-slate-800/40 rounded-2xl gap-2 active:bg-slate-700 transition-colors border border-slate-700/50">
            <Upload className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400">Import</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const parsed = JSON.parse(ev.target?.result as string);
                  if (Array.isArray(parsed)) onImportHistory(parsed);
                } catch (err) { console.error(err); }
              };
              reader.readAsText(file);
          }} accept=".json" className="hidden" />
        </div>
      </section>
    </div>
  );
};
