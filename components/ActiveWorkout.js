
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Save, Plus, Check, ChevronLeft, Trash2, X, AlertTriangle, ChevronUp, ChevronDown, Minimize2, StickyNote } from 'lucide-react';

const html = htm.bind(React.createElement);
const generateId = () => Math.random().toString(36).substring(2, 15);

export const ActiveWorkout = ({ session, editingWorkout, allExercises, history, onUpdateSession, onFinish, onCancel, onAbortWorkout, onAddExercise, onUpdateTemplate }) => {
  const [isStarted, setIsStarted] = useState(session ? session.isStarted : !!editingWorkout);
  const [exercises, setExercises] = useState(session ? session.exercises : []);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [confirmState, setConfirmState] = useState('none');
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    if (editingWorkout) {
      setExercises(editingWorkout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, completed: true }))
      })));
    }
  }, [editingWorkout]);

  useEffect(() => {
    if (!editingWorkout && session) {
      onUpdateSession({ ...session, isStarted, exercises });
    }
  }, [exercises, isStarted]);

  const handleFinishWorkout = () => {
    onFinish({
      id: editingWorkout ? editingWorkout.id : generateId(),
      templateId: session?.templateId,
      name: session?.name || editingWorkout?.name,
      date: editingWorkout ? editingWorkout.date : new Date().toISOString(),
      durationMinutes: 0,
      exercises: exercises.filter(ex => ex.sets.some(s => s.completed || s.weight > 0))
    });
  };

  const getExerciseName = (id) => allExercises.find(e => e.id === id)?.name || id;

  const moveExercise = (index, direction) => {
    const newEx = [...exercises];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newEx.length) return;
    [newEx[index], newEx[targetIndex]] = [newEx[targetIndex], newEx[index]];
    setExercises(newEx);
    
    if (!isStarted && session?.templateId) {
      onUpdateTemplate({
        ...session,
        id: session.templateId,
        exercises: newEx.map(ex => ex.exerciseId)
      });
    }
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    const newEx = [...exercises];
    const set = newEx[exIdx].sets[setIdx];
    if (field === 'completed') {
      set.completed = value;
    } else if (field === 'note') {
      set[field] = value;
    } else {
      set[field] = value === '' ? 0 : Number(value);
    }
    setExercises(newEx);
  };

  const toggleNote = (setId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [setId]: !prev[setId]
    }));
  };

  const removeSet = (exIdx, setIdx) => {
    const newEx = [...exercises];
    if (newEx[exIdx].sets.length > 1) {
      newEx[exIdx].sets.splice(setIdx, 1);
      setExercises(newEx);
    }
  };

  if (!isStarted) {
    return html`
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col pt-safe">
        <header className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shadow-lg">
          <button onClick=${onCancel} className="h-10 px-4 bg-slate-800 rounded-xl flex items-center gap-2 font-bold text-white text-xs active:scale-95 transition-all">
            <${ChevronLeft} size=${16} /> Zurück
          </button>
          <h2 className="font-bold text-white text-sm">Vorbereitung</h2>
          <div className="w-10"></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 mb-2">
            <h1 className="text-xl font-black text-white">${session?.name}</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Reihenfolge anpassen</p>
          </div>
          ${exercises.map((ex, idx) => html`
            <div key=${idx} className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex flex-col gap-1 shrink-0">
                 <button onClick=${() => moveExercise(idx, -1)} disabled=${idx === 0} className="p-1 text-slate-600 disabled:opacity-0 active:text-white"><${ChevronUp} size=${20} /></button>
                 <button onClick=${() => moveExercise(idx, 1)} disabled=${idx === exercises.length - 1} className="p-1 text-slate-600 disabled:opacity-0 active:text-white"><${ChevronDown} size=${20} /></button>
              </div>
              <span className="font-bold text-slate-100 text-sm flex-1">${getExerciseName(ex.exerciseId)}</span>
              <button onClick=${() => setExercises(exercises.filter((_, i) => i !== idx))} className="text-red-500/40 p-2 active:text-red-500"><${Trash2} size=${20} /></button>
            </div>
          `)}
          <button onClick=${() => setShowAddExercise(true)} className="w-full py-5 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 text-sm active:bg-slate-900 transition-all">
            <${Plus} size=${18} /> Übung hinzufügen
          </button>
        </main>
        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <button onClick=${() => setIsStarted(true)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-tighter">Starten</button>
        </div>
      </div>
    `;
  }

  return html`
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col pt-safe">
      <header className="bg-slate-900 border-b border-slate-800 p-3 h-16 flex justify-between items-center shrink-0 shadow-2xl">
          <button onClick=${onCancel} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-100 active:scale-95 transition-all">
            <${Minimize2} size=${20} />
          </button>
          <div className="text-emerald-400 font-black text-xs uppercase tracking-[0.15em] text-center px-2 truncate flex-1">${session?.name || editingWorkout?.name}</div>
          <button onClick=${() => setConfirmState('finish')} className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg"><${Save} size=${20} /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-6 pb-32">
        ${exercises.map((ex, exIdx) => html`
          <div key=${exIdx} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight truncate mr-2">${getExerciseName(ex.exerciseId)}</h3>
              <div className="flex gap-1 shrink-0">
                 <button onClick=${() => moveExercise(exIdx, -1)} disabled=${exIdx === 0} className="p-1.5 text-slate-500 disabled:opacity-0 active:scale-125 transition-all"><${ChevronUp} size=${18} /></button>
                 <button onClick=${() => moveExercise(exIdx, 1)} disabled=${exIdx === exercises.length - 1} className="p-1.5 text-slate-500 disabled:opacity-0 active:scale-125 transition-all"><${ChevronDown} size=${18} /></button>
              </div>
            </div>
            <div className="p-2 space-y-3">
              ${ex.sets.map((set, setIdx) => {
                const hasNote = set.note && set.note.trim().length > 0;
                return html`
                <div key=${set.id} className="space-y-1">
                  <div className=${`grid grid-cols-12 gap-1 items-center p-2 rounded-2xl border transition-all ${set.completed ? 'bg-emerald-600/10 border-emerald-500/30' : hasNote ? 'bg-red-500/5 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-slate-950/40 border-slate-800'}`}>
                    <div className="col-span-1 text-[9px] font-black text-slate-700 text-center">${setIdx + 1}</div>
                    
                    <div className="col-span-3">
                      <input type="number" step="0.5" inputMode="decimal" value=${set.weight || ''} placeholder="kg" onChange=${e => updateSet(exIdx, setIdx, 'weight', e.target.value)} className="w-full bg-slate-800 text-center py-3 rounded-xl border border-slate-700 font-black text-sm text-white outline-none focus:border-emerald-500 transition-all" />
                    </div>
                    
                    <div className="col-span-3">
                      <input type="number" inputMode="numeric" value=${set.reps || ''} placeholder="Wdh" onChange=${e => updateSet(exIdx, setIdx, 'reps', e.target.value)} className="w-full bg-slate-800 text-center py-3 rounded-xl border border-slate-700 font-black text-sm text-white outline-none focus:border-emerald-500 transition-all" />
                    </div>
                    
                    <div className="col-span-1">
                      <input type="number" inputMode="numeric" value=${set.rir === 0 ? '' : set.rir} placeholder="R" onChange=${e => updateSet(exIdx, setIdx, 'rir', e.target.value)} className="w-full bg-slate-800 text-center py-3 rounded-xl border border-slate-700 text-[10px] text-slate-400 font-bold outline-none" />
                    </div>
                    
                    <div className="col-span-4 flex justify-end items-center gap-0.5">
                      <button onClick=${() => removeSet(exIdx, setIdx)} className="w-7 h-9 flex items-center justify-center text-red-500/20 active:text-red-500 transition-colors">
                        <${Trash2} size=${14} />
                      </button>
                      
                      <button onClick=${() => toggleNote(set.id)} className=${`w-8 h-10 flex items-center justify-center rounded-xl transition-all ${hasNote ? 'text-white bg-red-600 shadow-lg' : 'text-slate-500 bg-slate-800 active:bg-slate-700'}`}>
                        <${StickyNote} size=${16} />
                      </button>
                      
                      <button onClick=${() => updateSet(exIdx, setIdx, 'completed', !set.completed)} className=${`w-10 h-11 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-slate-600 active:bg-slate-700'}`}>
                        <${Check} size=${20} />
                      </button>
                    </div>
                  </div>
                  
                  ${expandedNotes[set.id] && html`
                    <div className="px-1 animate-in slide-in-from-top-2 duration-200">
                      <textarea 
                        value=${set.note || ''}
                        onChange=${(e) => updateSet(exIdx, setIdx, 'note', e.target.value)}
                        placeholder="Notiz eingeben..."
                        className=${`w-full bg-slate-950/80 border rounded-2xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all ${hasNote ? 'border-red-500/50' : 'border-slate-800'}`}
                        rows="2"
                      ></textarea>
                    </div>
                  `}
                </div>
              `})}
              <button onClick=${() => {
                const newEx = [...exercises];
                newEx[exIdx].sets.push({ id: generateId(), weight: 0, reps: 0, rir: 0, completed: false, note: '' });
                setExercises(newEx);
              }} className="w-full py-3 border-2 border-dashed border-slate-800 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest active:bg-slate-800 transition-all">+ Satz hinzufügen</button>
            </div>
          </div>
        `)}
        <button onClick=${() => setShowAddExercise(true)} className="w-full py-5 border-2 border-dashed border-emerald-500/20 rounded-[32px] text-emerald-500 font-black flex items-center justify-center gap-2 bg-emerald-500/5 active:bg-emerald-500/10 transition-all text-xs uppercase tracking-widest">
            <${Plus} size=${18} /> Übung hinzufügen
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pb-safe flex flex-col gap-2">
        <button onClick=${() => setConfirmState('finish')} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all uppercase tracking-tighter">
          Training beenden
        </button>
        <button onClick=${() => setConfirmState('abort')} className="text-red-500/50 text-[10px] font-black uppercase tracking-[0.2em] py-2 active:text-red-500 transition-all">
          Workout abbrechen
        </button>
      </div>

      ${showAddExercise && html`
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full rounded-t-[40px] max-h-[75vh] flex flex-col overflow-hidden border-t border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <h3 className="font-black text-white uppercase tracking-widest text-sm">Übung hinzufügen</h3>
              <button onClick=${() => setShowAddExercise(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full text-slate-300 active:scale-90 transition-all"><${X} /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 pb-10">
              ${allExercises.sort((a,b)=>a.name.localeCompare(b.name)).map(ex => html`
                <button key=${ex.id} onClick=${() => {
                  setExercises([...exercises, { exerciseId: ex.id, sets: [{ id: generateId(), weight: 0, reps: 0, rir: 0, completed: false, note: '' }] }]);
                  setShowAddExercise(false);
                }} className="w-full text-left p-5 bg-slate-950/50 hover:bg-slate-800 rounded-2xl text-slate-100 font-bold border border-slate-800 active:bg-emerald-600 transition-all shadow-sm">
                  ${ex.name}
                </button>
              `)}
            </div>
          </div>
        </div>
      `}

      ${confirmState !== 'none' && html`
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-8 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 p-8 rounded-[40px] w-full max-w-xs text-center border border-slate-800 shadow-2xl">
            <div className=${`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmState === 'abort' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
              <${confirmState === 'abort' ? AlertTriangle : Save} size=${40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">${confirmState === 'abort' ? 'Abbrechen?' : 'Speichern?'}</h3>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed">${confirmState === 'abort' ? 'Alle Daten dieser Sitzung werden unwiderruflich gelöscht.' : 'Dein Fortschritt wird dauerhaft in deinem lokalen Verlauf gespeichert.'}</p>
            <div className="flex flex-col gap-3">
              <button onClick=${confirmState === 'abort' ? onAbortWorkout : handleFinishWorkout} className=${`w-full py-4 rounded-2xl font-black text-white shadow-lg active:scale-95 transition-all ${confirmState === 'abort' ? 'bg-red-600' : 'bg-emerald-600'}`}>BESTÄTIGEN</button>
              <button onClick=${() => setConfirmState('none')} className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black active:scale-95 transition-all">ZURÜCK</button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
};
