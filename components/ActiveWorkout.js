
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Save, Plus, Check, Clock, ChevronLeft, Trash2, X, AlertTriangle, History as HistoryIcon, ChevronUp, ChevronDown } from 'lucide-react';

const html = htm.bind(React.createElement);
const generateId = () => Math.random().toString(36).substring(2, 15);

export const ActiveWorkout = ({ template, editingWorkout, allExercises, history, onFinish, onCancel, onAddExercise, onUpdateTemplate }) => {
  const [isStarted, setIsStarted] = useState(!!editingWorkout);
  const [elapsedTime, setElapsedTime] = useState(editingWorkout ? editingWorkout.durationMinutes * 60 : 0);
  const [exercises, setExercises] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [confirmState, setConfirmState] = useState('none');
  const timerRef = useRef(null);

  useEffect(() => {
    if (editingWorkout) {
      setExercises(editingWorkout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, completed: true }))
      })));
    } else {
      const initialExercises = template.exercises.map(exId => ({
        exerciseId: exId,
        sets: [{ id: generateId(), weight: 0, reps: 0, rir: 0, completed: false }]
      }));
      setExercises(initialExercises);
    }
  }, [template, editingWorkout]);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = window.setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted]);

  const syncTemplateIfInPreparation = (newExerciseList) => {
    if (!isStarted && template && template.id && onUpdateTemplate) {
      onUpdateTemplate({
        ...template,
        exercises: newExerciseList.map(ex => ex.exerciseId)
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseName = (id) => {
    const exercise = allExercises.find(e => e.id === id);
    return exercise ? exercise.name : id; 
  };

  const getLastSessionData = (exerciseId) => {
    const prevWorkout = history.find(w => w.exercises.some(e => e.exerciseId === exerciseId));
    if (!prevWorkout) return null;
    return prevWorkout.exercises.find(e => e.exerciseId === exerciseId);
  };

  const handleFinishWorkout = () => {
    onFinish({
      id: editingWorkout ? editingWorkout.id : generateId(),
      templateId: template.id,
      name: template.name,
      date: editingWorkout ? editingWorkout.date : new Date().toISOString(),
      durationMinutes: Math.ceil(elapsedTime / 60),
      exercises: exercises.filter(ex => ex.sets.some(s => s.completed || s.weight > 0))
    });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    const set = newExercises[exIndex].sets[setIndex];
    
    if (field === 'completed') {
        const isCompleting = value;
        if (isCompleting && set.weight === 0 && set.reps === 0) {
            const lastData = getLastSessionData(newExercises[exIndex].exerciseId);
            const prevSet = lastData?.sets[setIndex];
            if (prevSet) {
                set.weight = prevSet.weight;
                set.reps = prevSet.reps;
                set.rir = prevSet.rir || 0;
            }
        }
        set.completed = isCompleting;
    } else {
        set[field] = value === '' ? 0 : Number(value);
    }
    setExercises(newExercises);
  };

  const removeSet = (exIndex, setIndex) => {
    const newExercises = [...exercises];
    if (newExercises[exIndex].sets.length <= 1) return;
    newExercises[exIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const addSet = (exIndex) => {
    const newExercises = [...exercises];
    const lastSet = newExercises[exIndex].sets[newExercises[exIndex].sets.length - 1];
    newExercises[exIndex].sets.push({
      id: generateId(),
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      rir: lastSet ? lastSet.rir : 0,
      completed: false
    });
    setExercises(newExercises);
  };

  const moveExercise = (index, direction) => {
    const newExercises = [...exercises];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newExercises.length) return;
    [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
    setExercises(newExercises);
    syncTemplateIfInPreparation(newExercises);
  };

  const handleAddCustomExercise = () => {
    const name = customExerciseName.trim();
    if (!name) return;
    const newExId = onAddExercise({ name, category: 'Andere' });
    const newList = [...exercises, { 
      exerciseId: newExId, 
      sets: [{ id: generateId(), weight: 0, reps: 0, rir: 0, completed: false }] 
    }];
    setExercises(newList);
    syncTemplateIfInPreparation(newList);
    setCustomExerciseName('');
    setShowAddExercise(false);
  };

  const sortedExercises = [...allExercises].sort((a, b) => a.name.localeCompare(b.name));

  if (!isStarted) {
    return html`
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
            <header className="p-3 h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0 pt-safe">
                <button onClick=${onCancel} className="h-10 px-4 bg-slate-800 rounded-xl flex items-center gap-2 font-bold active:bg-slate-700 transition-all text-white text-xs">
                  <${ChevronLeft} size=${16} /> Zurück
                </button>
                <h2 className="font-bold text-white text-sm">Vorbereitung</h2>
                <div className="w-10"></div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <h1 className="text-xl font-black text-white">${template.name}</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Änderungen hier werden in der Vorlage gespeichert.</p>
                </div>

                ${exercises.map((ex, idx) => html`
                    <div key=${idx} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-md">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100 text-sm">${getExerciseName(ex.exerciseId)}</span>
                          <div className="flex gap-1 mt-1">
                            <button onClick=${() => moveExercise(idx, -1)} disabled=${idx === 0} className="p-1 text-slate-500 disabled:opacity-10"><${ChevronUp} size=${14}/></button>
                            <button onClick=${() => moveExercise(idx, 1)} disabled=${idx === exercises.length - 1} className="p-1 text-slate-500 disabled:opacity-10"><${ChevronDown} size=${14}/></button>
                          </div>
                        </div>
                        <button onClick=${() => {
                          const newList = exercises.filter((_, i) => i !== idx);
                          setExercises(newList);
                          syncTemplateIfInPreparation(newList);
                        }} className="w-10 h-10 flex items-center justify-center text-red-500/60 active:bg-red-500/10 rounded-lg transition-colors">
                            <${Trash2} size=${18} />
                        </button>
                    </div>
                `)}

                <button onClick=${() => setShowAddExercise(true)} className="w-full py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 font-bold flex items-center justify-center gap-2 active:bg-slate-900 transition-colors text-sm">
                    <${Plus} size=${18} /> Übung zum Plan hinzufügen
                </button>
            </main>

            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 pb-safe">
                <button onClick=${() => setIsStarted(true)} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xl shadow-xl active:scale-95 transition-all">
                    STARTEN
                </button>
            </div>

            ${showAddExercise && html`
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-end justify-center">
                    <div className="bg-slate-900 w-full max-w-md rounded-t-[32px] border-t border-slate-800 flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-white text-lg">Übung wählen</h3>
                            <button onClick=${() => setShowAddExercise(false)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-slate-300"><${X} size=${18} /></button>
                        </div>
                        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
                            ${sortedExercises.map(ex => html`
                                <button key=${ex.id} onClick=${() => {
                                    const newList = [...exercises, { exerciseId: ex.id, sets: [{ id: generateId(), weight: 0, reps: 0, rir: 0, completed: false }] }];
                                    setExercises(newList);
                                    syncTemplateIfInPreparation(newList);
                                    setShowAddExercise(false);
                                }} className="w-full text-left p-4 bg-slate-950/50 hover:bg-slate-800 rounded-xl text-slate-200 active:bg-emerald-600 font-semibold border border-slate-800 text-sm">
                                    ${ex.name}
                                </button>
                            `)}
                        </div>
                    </div>
                </div>
            `}
        </div>
    `;
  }

  return html`
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-3 h-16 flex justify-between items-center shrink-0 pt-safe shadow-xl">
          <button onClick=${() => setConfirmState('cancel')} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center active:bg-slate-700 transition-all text-slate-100">
            <${ChevronLeft} size=${24} />
          </button>
          <div className="text-emerald-400 font-mono text-xl font-black flex items-center gap-2">
             <${Clock} className="w-5 h-5" /> ${formatTime(elapsedTime)}
          </div>
          <button onClick=${() => setConfirmState('finish')} className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center active:bg-emerald-500 shadow-lg transition-all">
            <${Save} size=${24} />
          </button>
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-4 pt-4 pb-32">
        ${exercises.map((ex, exIndex) => {
            const lastData = getLastSessionData(ex.exerciseId);
            return html`
                <div key=${exIndex} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                  <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">${getExerciseName(ex.exerciseId)}</h3>
                      ${lastData && html`
                          <div className="flex items-center gap-1.5 text-blue-400 text-[9px] font-bold mt-1 uppercase tracking-tighter bg-blue-500/10 w-fit px-2 py-0.5 rounded-full border border-blue-500/10">
                              <${HistoryIcon} size=${10} /> Verlauf verfügbar
                          </div>
                      `}
                    </div>
                    <div className="flex gap-0.5">
                      <button onClick=${() => moveExercise(exIndex, -1)} disabled=${exIndex === 0} className="p-1.5 text-slate-500 disabled:opacity-10"><${ChevronUp} size=${18} /></button>
                      <button onClick=${() => moveExercise(exIndex, 1)} disabled=${exIndex === exercises.length - 1} className="p-1.5 text-slate-500 disabled:opacity-10"><${ChevronDown} size=${18} /></button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    ${ex.sets.map((set, setIndex) => {
                        const prevSet = lastData?.sets[setIndex];
                        return html`
                            <div key=${set.id} className="space-y-0.5">
                                <div className=${`grid grid-cols-12 gap-1 items-center p-2 rounded-xl transition-all border ${set.completed ? 'bg-emerald-600/10 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800'}`}>
                                    <div className="col-span-1 text-center font-black text-slate-700 text-[9px]">${setIndex + 1}</div>
                                    <div className="col-span-3">
                                        <input 
                                            type="number" 
                                            inputMode="decimal" 
                                            value=${set.weight === 0 ? '' : set.weight} 
                                            placeholder=${prevSet ? prevSet.weight : 'kg'} 
                                            onChange=${(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} 
                                            className=${`w-full bg-slate-800 text-center py-2.5 rounded-lg border border-slate-700 outline-none font-black text-sm ${set.weight === 0 ? 'text-slate-500 italic' : 'text-white'}`} 
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input 
                                            type="number" 
                                            inputMode="numeric" 
                                            value=${set.reps === 0 ? '' : set.reps} 
                                            placeholder=${prevSet ? prevSet.reps : 'Wdh'} 
                                            onChange=${(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} 
                                            className=${`w-full bg-slate-800 text-center py-2.5 rounded-lg border border-slate-700 outline-none font-black text-sm ${set.reps === 0 ? 'text-slate-500 italic' : 'text-white'}`} 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number" 
                                            inputMode="numeric" 
                                            value=${set.rir === 0 && set.completed === false ? '' : set.rir} 
                                            placeholder=${prevSet ? prevSet.rir : 'RIR'} 
                                            onChange=${(e) => updateSet(exIndex, setIndex, 'rir', e.target.value)} 
                                            className=${`w-full bg-slate-800 text-center py-2.5 rounded-lg border border-slate-700 outline-none font-bold text-[10px] ${set.rir === 0 && !set.completed ? 'text-slate-600' : 'text-slate-300'}`} 
                                        />
                                    </div>
                                    <div className="col-span-3 flex justify-end gap-1">
                                        <button onClick=${() => removeSet(exIndex, setIndex)} className="w-8 h-10 flex items-center justify-center rounded-lg bg-slate-900 text-red-500/30 active:text-red-500">
                                          <${Trash2} size=${14} />
                                        </button>
                                        <button onClick=${() => updateSet(exIndex, setIndex, 'completed', !set.completed)} className=${`w-10 h-10 flex items-center justify-center rounded-lg transition-all shadow-md ${set.completed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                            <${Check} size=${18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    })}
                    <button onClick=${() => addSet(exIndex)} className="w-full py-2.5 border border-dashed border-slate-800 text-slate-500 font-bold rounded-lg active:bg-slate-800 transition-colors text-[10px] uppercase tracking-wider">+ Satz</button>
                  </div>
                </div>
            `;
        })}

        <button onClick=${() => setShowAddExercise(true)} className="w-full py-4 border border-dashed border-emerald-500/20 rounded-2xl text-emerald-500 font-bold flex items-center justify-center gap-2 bg-emerald-500/5 active:bg-emerald-500/10 transition-colors mt-4 text-xs">
            <${Plus} size=${18} /> Übung für diese Session hinzufügen
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8 pb-safe shrink-0">
          <button onClick=${() => setConfirmState('finish')} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg shadow-2xl active:scale-95 transition-all">
            ${editingWorkout ? 'ÄNDERUNGEN SPEICHERN' : 'TRAINING BEENDEN'}
          </button>
      </div>

      ${showAddExercise && html`
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-end justify-center">
              <div className="bg-slate-900 w-full max-w-md rounded-t-[32px] border-t border-slate-800 flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-white text-lg">Übung hinzufügen</h3>
                      <button onClick=${() => setShowAddExercise(false)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-slate-300"><${X} size=${18} /></button>
                  </div>
                  <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
                      ${sortedExercises.map(ex => html`
                          <button key=${ex.id} onClick=${() => {
                              setExercises([...exercises, { exerciseId: ex.id, sets: [{ id: generateId(), weight: 0, reps: 0, rir: 0, completed: false }] }]);
                              setShowAddExercise(false);
                          }} className="w-full text-left p-4 bg-slate-950/50 hover:bg-slate-800 rounded-xl text-slate-200 active:bg-emerald-600 font-semibold border border-slate-800 text-sm">
                              ${ex.name}
                          </button>
                      `)}
                  </div>
              </div>
          </div>
      `}

      ${confirmState !== 'none' && html`
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 z-[200]">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] w-full max-w-xs text-center shadow-2xl">
                  <div className=${`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmState === 'cancel' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      <${confirmState === 'cancel' ? AlertTriangle : Save} size=${32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">${confirmState === 'cancel' ? 'Abbrechen?' : 'Speichern?'}</h3>
                  <div className="flex flex-col gap-3">
                    <button onClick=${confirmState === 'cancel' ? onCancel : handleFinishWorkout} className=${`w-full py-3 rounded-xl font-bold text-white text-sm ${confirmState === 'cancel' ? 'bg-red-600' : 'bg-emerald-600'}`}>Bestätigen</button>
                    <button onClick=${() => setConfirmState('none')} className="w-full py-3 bg-slate-800 rounded-xl text-slate-400 font-bold text-sm">Zurück</button>
                  </div>
              </div>
          </div>
      `}
    </div>
  `;
};
