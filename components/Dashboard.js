
import React, { useRef, useState } from 'react';
import htm from 'htm';
import { Play, Download, Upload, ShieldCheck, Scale, Plus, Settings, Trash2, Edit2, X, Check } from 'lucide-react';

const html = htm.bind(React.createElement);

export const Dashboard = ({ 
  templates, 
  exercises,
  history, 
  onAddWeight, 
  onStartWorkout, 
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onImportHistory 
}) => {
  const fileInputRef = useRef(null);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

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

  const startNewTemplate = () => {
    setEditingTemplate({ id: null, name: 'Neuer Plan', exercises: [] });
  };

  const saveTemplate = () => {
    if (!editingTemplate.name.trim()) return;
    if (editingTemplate.id) {
      onUpdateTemplate(editingTemplate);
    } else {
      onAddTemplate(editingTemplate.name, editingTemplate.exercises);
    }
    setEditingTemplate(null);
  };

  const toggleExerciseInTemplate = (exId) => {
    const current = [...editingTemplate.exercises];
    if (current.includes(exId)) {
      setEditingTemplate({ ...editingTemplate, exercises: current.filter(id => id !== exId) });
    } else {
      setEditingTemplate({ ...editingTemplate, exercises: [...current, exId] });
    }
  };

  return html`
    <div className="space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">KraftLog</h1>
        <p className="text-slate-400 font-medium italic">Privat. Lokal. Sicher.</p>
      </header>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest text-xs">
            <${Play} className="w-4 h-4 fill-current" /> Training starten
          </h2>
          <button 
            onClick=${() => setIsEditingTemplates(!isEditingTemplates)}
            className=${`p-2 rounded-lg transition-colors ${isEditingTemplates ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <${Settings} size=${18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          ${templates.map(tpl => html`
            <div key=${tpl.id} className="relative group">
              <button
                onClick=${() => !isEditingTemplates && onStartWorkout(tpl.id)}
                className=${`w-full bg-slate-900 p-6 rounded-[28px] text-left border border-slate-800 transition-all flex justify-between items-center shadow-lg ${isEditingTemplates ? 'cursor-default' : 'active:bg-slate-800 active:scale-[0.98]'}`}
              >
                <div>
                  <h3 className="font-bold text-xl text-slate-100">${tpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">${tpl.exercises.length} Übungen</p>
                </div>
                ${!isEditingTemplates && html`
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                    <${Play} className="w-6 h-6 fill-current" />
                  </div>
                `}
              </button>

              ${isEditingTemplates && html`
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick=${() => setEditingTemplate(tpl)}
                    className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                  >
                    <${Edit2} size=${18} />
                  </button>
                  <button 
                    onClick=${() => onDeleteTemplate(tpl.id)}
                    className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                  >
                    <${Trash2} size=${18} />
                  </button>
                </div>
              `}
            </div>
          `)}

          ${isEditingTemplates && html`
            <button 
              onClick=${startNewTemplate}
              className="w-full py-5 border-2 border-dashed border-slate-800 rounded-[28px] text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-emerald-500/50 hover:text-emerald-500 transition-all"
            >
              <${Plus} size=${20} /> Neuen Tag hinzufügen
            </button>
          `}
        </div>
      </section>

      <!-- Template Editor Modal -->
      ${editingTemplate && html`
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-slate-900 w-full max-w-md rounded-t-[40px] border-t border-slate-800 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-white text-xl">${editingTemplate.id ? 'Tag bearbeiten' : 'Neuer Tag'}</h3>
              <button onClick=${() => setEditingTemplate(null)} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full text-slate-300"><${X} /></button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Name des Trainingstages</label>
                <input 
                  type="text"
                  value=${editingTemplate.name}
                  onChange=${(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  placeholder="z.B. Oberkörper"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Übungen auswählen</label>
                <div className="space-y-2">
                  ${exercises.map(ex => html`
                    <button 
                      key=${ex.id}
                      onClick=${() => toggleExerciseInTemplate(ex.id)}
                      className=${`w-full p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${editingTemplate.exercises.includes(ex.id) ? 'bg-emerald-600/10 border-emerald-500 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400'}`}
                    >
                      <span className="font-bold text-sm">${ex.name}</span>
                      ${editingTemplate.exercises.includes(ex.id) && html`<${Check} size=${16} className="text-emerald-500" />`}
                    </button>
                  `)}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0">
              <button 
                onClick=${saveTemplate}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      `}

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
