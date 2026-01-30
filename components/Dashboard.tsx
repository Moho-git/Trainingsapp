import React, { useRef, useState } from 'react';
import { CompletedWorkout, WorkoutTemplate } from '../types';
import { Play, TrendingUp, Download, Upload, ShieldCheck, Smartphone, Info, Github, ChevronRight, Lock } from 'lucide-react';
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
    link.download = `kraftlog_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">KraftLog</h1>
        <p className="text-slate-400 font-medium italic">Tracking ohne Kompromisse.</p>
      </header>

      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <Play className="w-5 h-5 fill-current" /> Training
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

      {/* Handy Setup Info */}
      <section className="bg-indigo-950/30 p-6 rounded-[32px] border border-indigo-500/30 shadow-2xl">
        <button 
          onClick={() => setShowSetup(!showSetup)}
          className="w-full flex items-center justify-between text-indigo-400"
        >
          <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
            <Smartphone className="w-5 h-5" /> Auf dem Handy nutzen
          </h2>
          <ChevronRight className={`w-5 h-5 transition-transform ${showSetup ? 'rotate-90' : ''}`} />
        </button>
        
        {showSetup && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Du brauchst <b>keinen API-Key</b> für das tägliche Training. Um die App als echtes Icon auf dein Handy zu bekommen:
              </p>
              <ol className="text-[11px] text-slate-400 space-y-3 list-decimal ml-4">
                <li>Lade die Dateien auf <b>GitHub</b> hoch (Anleitung findest du online unter "GitHub Pages").</li>
                <li>Öffne deine GitHub-URL am Handy.</li>
                <li>Tippe im Browser auf <b>"Zum Home-Bildschirm hinzufügen"</b>.</li>
              </ol>
            </div>
            <div className="flex gap-3 text-[10px] text-amber-300/60 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
              <Lock className="shrink-0 w-4 h-4" />
              <p>Deine Daten bleiben zu 100% auf deinem Handy (Local Storage). Kein Server sieht dein Training.</p>
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Letzte 7 Tage
            </h2>
            <button onClick={onNavigateToHistory} className="text-xs text-blue-400 font-bold bg-blue-400/10 px-3 py-1.5 rounded-full">Verlauf</button>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
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
        <h2 className="text-sm font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <ShieldCheck className="w-5 h-5" /> Backup
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleExport} className="flex flex-col items-center p-4 bg-slate-800/50 rounded-2xl gap-2 active:bg-slate-700 transition-colors border border-slate-700/50">
            <Download className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase">Export</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-4 bg-slate-800/50 rounded-2xl gap-2 active:bg-slate-700 transition-colors border border-slate-700/50">
            <Upload className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase">Import</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
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
            }} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </section>
    </div>
  );
};