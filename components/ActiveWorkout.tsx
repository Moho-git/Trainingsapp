import React, { useState, useEffect, useRef } from 'react';
import { CompletedWorkout, Exercise, WorkoutExercise, WorkoutSet, WorkoutTemplate } from '../types';
import { Save, Plus, Check, Clock, ChevronLeft, History as HistoryIcon, Play, Trash2, X, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface ActiveWorkoutProps {
  template: WorkoutTemplate;
  allExercises: Exercise[];
  history: CompletedWorkout[];
  onFinish: (workout: CompletedWorkout) => void;
  onCancel: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  template,
  allExercises,
  history,
  onFinish,
  onCancel
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [confirmState, setConfirmState] = useState<'none' | 'cancel' | 'finish'>('none');
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const initialExercises: WorkoutExercise[] = template.exercises.map(exId => ({
      exerciseId: exId,
      sets: [{ id: generateId(), weight: 0, reps: 0, rpe: 0, completed: false }]
    }));
    setExercises(initialExercises);
  }, [template]);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = window.setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseName = (id: string) => allExercises.find(e => e.id === id)?.name || 'Übung';

  const getLastSessionData = (exerciseId: string) => {
    const prevWorkout = history.find(w => w.exercises.some(e => e.exerciseId === exerciseId));
    if (!prevWorkout) return null;
    return prevWorkout.exercises.find(e => e.exerciseId === exerciseId);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const newExercises = [...exercises];
    const set = newExercises[exIndex].sets[setIndex];
    if (field === 'completed') {
        set.completed = value;
    } else {
        const numValue = value === '' ? 0 : Number(value);
        (set as any)[field] = numValue;
    }
    setExercises(newExercises);
  };

  const addSet = (exIndex: number) => {
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
    const workout: CompletedWorkout = {
      id: generateId(),
      templateId: template.id,
      name: template.name,
      date: new Date().toISOString(),
      durationMinutes: Math.ceil(elapsedTime / 60),
      exercises: exercises.filter(ex => ex.sets.some(s => s.weight > 0 || s.reps > 0 || s.completed))
    };
    onFinish(workout);
  };

  if (!isStarted) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
            <header className="p-4 h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between pt-safe">
                <button onClick={onCancel} className="h-12 px-6 text-slate-100 bg-slate-800 rounded-2xl flex items-center gap-2 active:bg-slate-700 font-bold transition-all">
                  <ChevronLeft className="w-6 h-6" /> Zurück
                </button>
                <h2 className="font-bold text-white text-lg">Check</h2>
                <div className="w-12"></div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl mb-4">
                    <h1 className="text-2xl font-bold text-white mb-1">{template.name}</h1>
                    <p className="text-slate-400 text-sm">Übersicht der heutigen Übungen.</p>
                </div>

                {exercises.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800">
                        <span className="font-bold text-slate-100">{getExerciseName(ex.exerciseId)}</span>
                        <button onClick={() => setExercises(exercises.filter((_, i) => i !== idx))} className="w-12 h-12 flex items-center justify-center text-red-500 active:bg-red-500/10 rounded-xl">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                <button onClick={() => setShowAddExercise(true)} className="w-full py-5 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 active:bg-slate-900 transition-colors">
                    <Plus size={20} /> Übung hinzufügen
                </button>
            </main>

            <div className="p-6 bg-slate-900 border-t border-slate-800 pb-safe">
                <button onClick={() => setIsStarted(true)} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-2xl">
                    <Play className="w-8 h-8 fill-current" /> STARTEN
                </button>
            </div>

            {showAddExercise && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end justify-center">
                    <div className="bg-slate-900 w-full max-w-md rounded-t-[40px] border-t border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-white text-xl">Wählen</h3>
                            <button onClick={() => setShowAddExercise(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full text-slate-300"><X /></button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-2">
                            {allExercises.map(ex => (
                                <button key={ex.id} onClick={() => {
                                      setExercises([...exercises, { exerciseId: ex.id, sets: [{ id: generateId(), weight: 0, reps: 0, rpe: 0, completed: false }] }]);
                                      setShowAddExercise(false);
                                  }} className="w-full text-left p-5 bg-slate-950/50 hover:bg-slate-800 rounded-2xl text-slate-200 active:bg-emerald-600 font-semibold border border-slate-800">
                                    {ex.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
      {confirmState !== 'none' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 w-full max-w-xs text-center shadow-2xl">
                <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmState === 'cancel' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {confirmState === 'cancel' ? <AlertTriangle size={40} /> : <Save size={40} />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{confirmState === 'cancel' ? 'Abbrechen?' : 'Beenden?'}</h3>
                <div className="flex flex-col gap-4">
                    <button onClick={confirmState === 'cancel' ? onCancel : handleFinishWorkout} className={`w-full py-5 rounded-2xl font-bold text-white text-lg ${confirmState === 'cancel' ? 'bg-red-600' : 'bg-emerald-600'} shadow-lg active:scale-95 transition-all`}>
                        {confirmState === 'cancel' ? 'Löschen' : 'Speichern'}
                    </button>
                    <button onClick={() => setConfirmState('none')} className="w-full py-5 rounded-2xl font-bold text-slate-400 bg-slate-800 active:bg-slate-700 transition-all">
                        Abbrechen
                    </button>
                </div>
            </div>
        </div>
      )}

      <header className="h-20 bg-slate-900 border-b border-slate-800 p-4 shadow-xl flex justify-between items-center shrink-0 pt-safe">
          <button onClick={() => setConfirmState('cancel')} className="w-14 h-14 flex items-center justify-center text-slate-100 bg-slate-800 rounded-2xl active:bg-slate-700">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="text-center">
            <div className="text-emerald-400 font-mono text-2xl font-black flex items-center justify-center gap-2">
              <Clock className="w-6 h-6" /> {formatTime(elapsedTime)}
            </div>
          </div>
          <button onClick={() => setConfirmState('finish')} className="bg-emerald-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center active:bg-emerald-500 shadow-lg">
            <Save className="w-8 h-8" />
          </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-28 pt-4">
        {exercises.map((ex, exIndex) => {
            const lastData = getLastSessionData(ex.exerciseId);
            return (
                <div key={exIndex} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                    <h3 className="text-xl font-bold text-slate-100 mb-1">{getExerciseName(ex.exerciseId)}</h3>
                    {lastData && (
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold bg-blue-950/30 px-3 py-1.5 rounded-full w-fit">
                            <HistoryIcon size={12} /> Letztes Mal: {lastData.sets[0]?.weight}kg x {lastData.sets[0]?.reps}
                        </div>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                      {ex.sets.map((set, setIndex) => {
                          const prevSet = lastData?.sets[setIndex];
                          return (
                              <div key={set.id} className="space-y-1">
                                  {prevSet && (
                                      <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500/60 ml-12 mb-0.5">
                                          <ArrowUpRight size={10} /> Letztes Mal: {prevSet.weight}kg x {prevSet.reps}
                                      </div>
                                  )}
                                  <div className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl transition-all border-2 ${set.completed ? 'bg-emerald-600/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800'}`}>
                                    <div className="col-span-1 text-center font-black text-slate-700 text-xs">{setIndex + 1}</div>
                                    <div className="col-span-4">
                                      <input type="number" inputMode="decimal" value={set.weight || ''} placeholder="kg" onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} className="w-full bg-slate-800 text-center text-white py-4 rounded-xl border border-slate-700 outline-none font-black" />
                                    </div>
                                    <div className="col-span-3">
                                      <input type="number" inputMode="numeric" value={set.reps || ''} placeholder="Wdh" onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} className="w-full bg-slate-800 text-center text-white py-4 rounded-xl border border-slate-700 outline-none font-black" />
                                    </div>
                                    <div className="col-span-2">
                                       <input type="number" inputMode="numeric" value={set.rpe || ''} placeholder="RIR" onChange={(e) => updateSet(exIndex, setIndex, 'rpe', e.target.value)} className="w-full bg-slate-800 text-center text-slate-400 py-4 rounded-xl border border-slate-700 outline-none text-xs" />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                      <button onClick={() => updateSet(exIndex, setIndex, 'completed', !set.completed)} className={`w-12 h-12 flex items-center justify-center rounded-2xl active:scale-75 transition-all shadow-md ${set.completed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-700'}`}>
                                        <Check size={24} />
                                      </button>
                                    </div>
                                  </div>
                              </div>
                          );
                      })}
                      <button onClick={() => addSet(exIndex)} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 font-black flex items-center justify-center gap-2 text-xs active:bg-slate-800">
                        <Plus size={16} /> Satz hinzufügen
                      </button>
                  </div>
                </div>
            );
        })}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none pb-safe">
          <button onClick={() => setConfirmState('finish')} className="pointer-events-auto w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl text-lg active:scale-95 transition-all flex items-center justify-center gap-3">
              <Save size={24} /> TRAINING BEENDEN
          </button>
      </div>
    </div>
  );
};