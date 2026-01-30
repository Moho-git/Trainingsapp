
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Save, Plus, Check, Clock, ChevronLeft, Trash2, X, AlertTriangle } from 'lucide-react';

const html = htm.bind(React.createElement);
const generateId = () => Math.random().toString(36).substring(2, 15);

export const ActiveWorkout = ({ template, allExercises, history, onFinish, onCancel }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [confirmState, setConfirmState] = useState('none');
  const timerRef = useRef(null);

  useEffect(() => {
    const initialExercises = template.exercises.map(exId => ({
      exerciseId: exId,
      sets: [{ id: generateId(), weight: 0, reps: 0, rpe: 0, completed: false }]
    }));
    setExercises(initialExercises);
  }, [template]);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = window.setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseName = (id) => allExercises.find(e => e.id === id)?.name || 'Übung';

  const updateSet = (exIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    const set = newExercises[exIndex].sets[setIndex];
    if (field === 'completed') {
        set.completed = value;
    } else {
        set[field] = value === '' ? 0 : Number(value);
    }
    setExercises(newExercises);
  };

  const addSet = (exIndex) => {
    const newExercises = [...exercises];
    const lastSet = newExercises[exIndex].sets[newExercises[exIndex].sets.length - 1];
    newExercises[exIndex].sets.push({
      id: generateId(),
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      rpe: 0,
      completed: false
    });
    setExercises(newExercises);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const addNewExercise = (exId) => {
    setExercises([...exercises, {
      exerciseId: exId,
      sets: [{ id: generateId(), weight: 0, reps: 0, rpe: 0, completed: false }]
    }]);
    setShowAddExercise(false);
  };

  const handleFinishWorkout = () => {
    onFinish({
      id: generateId(),
      name: template.name,
      date: new Date().toISOString(),
      durationMinutes: Math.ceil(elapsedTime / 60),
      exercises: exercises.filter(ex => ex.sets.some(s => s.completed))
    });
  };

  // Vor dem Start Ansicht (Check-Liste)
  if (!isStarted) {
    return html`
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
            <header className="p-4 h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
                <button onClick=${onCancel} className="h-12 px-6 bg-slate-800 rounded-2xl flex items-center gap-2 font-bold active:bg-slate-700 transition-all">
                  <${ChevronLeft} /> Zurück
                </button>
                <h2 className="font-bold text-white">Workout Check</h2>
                <div className="w-12"></div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 mb-2">
                    <h1 className="text-2xl font-black text-white">${template.name}</h1>
                    <p className="text-slate-500 text-sm mt-1">Passe deine Übungen für heute an.</p>
                </div>

                ${exercises.map((ex, idx) => html`
                    <div key=${idx} className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
                        <span className="font-bold text-slate-100">${getExerciseName(ex.exerciseId)}</span>
                        <button onClick=${() => removeExercise(idx)} className="w-12 h-12 flex items-center justify-center text-red-500 active:bg-red-500/10 rounded-xl transition-colors">
                            <${Trash2} size=${20} />
                        </button>
                    </div>
                `)}

                <button onClick=${() => setShowAddExercise(true)} className="w-full py-5 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 active:bg-slate-900 transition-colors mt-4">
                    <${Plus} size=${20} /> Übung hinzufügen
                </button>
                <div className="h-24"></div> 
            </main>

            <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0">
                <button onClick=${() => setIsStarted(true)} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-2xl shadow-2xl active:scale-95 transition-all">
                    STARTEN
                </button>
            </div>

            ${showAddExercise && html`
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-end justify-center">
                    <div className="bg-slate-900 w-full max-w-md rounded-t-[40px] border-t border-slate-800 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-white text-xl">Übung wählen</h3>
                            <button onClick=${() => setShowAddExercise(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full text-slate-300"><${X} /></button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-2">
                            ${allExercises.map(ex => html`
                                <button key=${ex.id} onClick=${() => addNewExercise(ex.id)} className="w-full text-left p-5 bg-slate-950/50 hover:bg-slate-800 rounded-2xl text-slate-200 active:bg-emerald-600 font-semibold border border-slate-800 transition-colors">
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

  // Aktive Trainingsansicht
  return html`
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-4 h-20 flex justify-between items-center shrink-0">
          <button onClick=${() => setConfirmState('cancel')} className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center active:bg-slate-700 transition-all text-slate-100">
            <${ChevronLeft} size=${28} />
          </button>
          <div className="text-emerald-400 font-mono text-2xl font-black flex items-center gap-2">
             <${Clock} className="w-6 h-6" /> ${formatTime(elapsedTime)}
          </div>
          <button onClick=${() => setConfirmState('finish')} className="bg-emerald-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center active:bg-emerald-500 shadow-lg transition-all">
            <${Save} size=${28} />
          </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pt-6">
        ${exercises.map((ex, exIndex) => html`
            <div key=${exIndex} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-6 bg-slate-800/30 border-b border-slate-800">
                <h3 className="text-xl font-bold text-slate-100">${getExerciseName(ex.exerciseId)}</h3>
              </div>
              <div className="p-5 space-y-4">
                ${ex.sets.map((set, setIndex) => html`
                    <div key=${set.id} className=${`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl transition-all border-2 ${set.completed ? 'bg-emerald-600/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800'}`}>
                      <div className="col-span-1 text-center font-black text-slate-700 text-xs">${setIndex + 1}</div>
                      <div className="col-span-4">
                        <input type="number" inputMode="decimal" value=${set.weight || ''} placeholder="kg" onChange=${(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} className="w-full bg-slate-800 text-center text-white py-4 rounded-xl border border-slate-700 outline-none font-black" />
                      </div>
                      <div className="col-span-4">
                        <input type="number" inputMode="numeric" value=${set.reps || ''} placeholder="Wdh" onChange=${(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} className="w-full bg-slate-800 text-center text-white py-4 rounded-xl border border-slate-700 outline-none font-black" />
                      </div>
                      <div className="col-span-3">
                        <button onClick=${() => updateSet(exIndex, setIndex, 'completed', !set.completed)} className=${`w-full h-14 flex items-center justify-center rounded-xl transition-all ${set.completed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                          <${Check} size=${24} />
                        </button>
                      </div>
                    </div>
                `)}
                <button onClick=${() => addSet(exIndex)} className="w-full py-4 border-2 border-dashed border-slate-800 text-slate-500 font-bold rounded-xl active:bg-slate-800 transition-colors">+ Satz hinzufügen</button>
              </div>
            </div>
        `)}
        <div className="h-32"></div>
      </main>

      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-900 shrink-0">
          <button onClick=${() => setConfirmState('finish')} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all">
            TRAINING BEENDEN
          </button>
      </div>

      ${confirmState !== 'none' && html`
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 z-[200]">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] w-full max-w-xs text-center shadow-2xl">
                  <div className=${`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmState === 'cancel' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      <${confirmState === 'cancel' ? AlertTriangle : Check} size=${40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">${confirmState === 'cancel' ? 'Abbrechen?' : 'Speichern?'}</h3>
                  <div className="flex flex-col gap-4">
                    <button onClick=${confirmState === 'cancel' ? onCancel : handleFinishWorkout} className=${`w-full py-4 rounded-2xl font-bold text-white ${confirmState === 'cancel' ? 'bg-red-600' : 'bg-emerald-600'}`}>Bestätigen</button>
                    <button onClick=${() => setConfirmState('none')} className="w-full py-4 bg-slate-800 rounded-2xl text-slate-400 font-bold">Zurück</button>
                  </div>
              </div>
          </div>
      `}
    </div>
  `;
};
