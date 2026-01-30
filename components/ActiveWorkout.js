
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Save, Plus, Check, Clock, ChevronLeft, Trash2 } from 'lucide-react';

const html = htm.bind(React.createElement);
const generateId = () => Math.random().toString(36).substring(2, 15);

export const ActiveWorkout = ({ template, allExercises, history, onFinish, onCancel }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState([]);
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

  const handleFinishWorkout = () => {
    onFinish({
      id: generateId(),
      name: template.name,
      date: new Date().toISOString(),
      durationMinutes: Math.ceil(elapsedTime / 60),
      exercises: exercises.filter(ex => ex.sets.some(s => s.completed))
    });
  };

  if (!isStarted) {
    return html`
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            <header className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <button onClick=${onCancel} className="h-12 px-6 bg-slate-800 rounded-2xl flex items-center gap-2 font-bold">
                  <${ChevronLeft} /> Zurück
                </button>
            </header>
            <main className="flex-1 p-4 space-y-4">
                ${exercises.map((ex, idx) => html`
                    <div key=${idx} className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800">
                        <span className="font-bold">${getExerciseName(ex.exerciseId)}</span>
                    </div>
                `)}
            </main>
            <div className="p-6 bg-slate-900">
                <button onClick=${() => setIsStarted(true)} className="w-full bg-emerald-600 py-6 rounded-2xl font-black text-2xl">
                    STARTEN
                </button>
            </div>
        </div>
    `;
  }

  return html`
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
          <button onClick=${() => setConfirmState('cancel')} className="w-12 h-12 bg-slate-800 rounded-xl"><${ChevronLeft} /></button>
          <div className="text-emerald-400 font-mono text-2xl font-black">${formatTime(elapsedTime)}</div>
          <button onClick=${() => setConfirmState('finish')} className="bg-emerald-600 w-12 h-12 rounded-xl"><${Save} /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        ${exercises.map((ex, exIndex) => html`
            <div key=${exIndex} className="bg-slate-900 rounded-[32px] border border-slate-800 p-5">
              <h3 className="text-xl font-bold mb-4">${getExerciseName(ex.exerciseId)}</h3>
              ${ex.sets.map((set, setIndex) => html`
                  <div key=${set.id} className="grid grid-cols-12 gap-2 mb-2">
                    <input type="number" value=${set.weight || ''} placeholder="kg" onChange=${(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} className="col-span-5 bg-slate-800 text-center py-4 rounded-xl" />
                    <input type="number" value=${set.reps || ''} placeholder="Wdh" onChange=${(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} className="col-span-4 bg-slate-800 text-center py-4 rounded-xl" />
                    <button onClick=${() => updateSet(exIndex, setIndex, 'completed', !set.completed)} className=${`col-span-3 rounded-xl ${set.completed ? 'bg-emerald-500' : 'bg-slate-800'}`}><${Check} /></button>
                  </div>
              `)}
              <button onClick=${() => addSet(exIndex)} className="w-full py-2 border-2 border-dashed border-slate-800 text-slate-500 mt-2 rounded-xl">+ Satz</button>
            </div>
        `)}
      </main>
      <div className="p-4 bg-slate-950">
          <button onClick=${() => setConfirmState('finish')} className="w-full bg-emerald-600 py-5 rounded-2xl font-bold">BEENDEN</button>
      </div>
      ${confirmState !== 'none' && html`
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-8 z-[100]">
              <div className="bg-slate-900 p-8 rounded-3xl w-full text-center">
                  <h3 className="text-2xl font-bold mb-6">${confirmState === 'cancel' ? 'Abbrechen?' : 'Speichern?'}</h3>
                  <button onClick=${confirmState === 'cancel' ? onCancel : handleFinishWorkout} className="w-full py-4 bg-emerald-600 rounded-xl mb-4 font-bold">Bestätigen</button>
                  <button onClick=${() => setConfirmState('none')} className="w-full py-4 bg-slate-800 rounded-xl">Zurück</button>
              </div>
          </div>
      `}
    </div>
  `;
};
