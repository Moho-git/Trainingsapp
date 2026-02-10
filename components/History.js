
import React, { useState } from 'react';
import htm from 'htm';
import { Trash2, ChevronLeft, Calendar, Clock, Dumbbell, ArrowRight, Edit2 } from 'lucide-react';

const html = htm.bind(React.createElement);

export const History = ({ history, exercises, onDeleteWorkout, onEditWorkout }) => {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getExerciseName = (id) => exercises.find(e => e.id === id)?.name || 'Unbekannte Übung';

  const handleDelete = (e, workout) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (window.confirm(`Training "${workout.name}" vom ${new Date(workout.date).toLocaleDateString('de-DE')} wirklich löschen?`)) {
      onDeleteWorkout(workout.id);
      setSelectedWorkout(null);
    }
  };

  if (selectedWorkout) {
    return html`
      <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col overflow-hidden pt-safe">
        <header className="p-4 h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0 shadow-2xl">
          <button onClick=${() => setSelectedWorkout(null)} className="h-12 px-5 bg-slate-800 rounded-2xl flex items-center gap-2 font-bold text-white text-xs active:bg-slate-700 transition-all">
            <${ChevronLeft} size=${20} /> Zurück
          </button>
          <h2 className="font-bold text-white text-sm uppercase tracking-widest">Details</h2>
          <div className="flex gap-2">
            <button onClick=${() => {
              onEditWorkout(selectedWorkout);
              setSelectedWorkout(null);
            }} className="w-12 h-12 flex items-center justify-center text-blue-400 bg-blue-500/10 rounded-xl active:scale-95 transition-all border border-blue-500/20">
              <${Edit2} size=${20} />
            </button>
            <button onClick=${(e) => handleDelete(e, selectedWorkout)} className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-500/10 rounded-xl active:scale-95 transition-all border border-red-500/20">
              <${Trash2} size=${20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-12">
          <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-xl">
            <h1 className="text-2xl font-black text-white leading-tight">${selectedWorkout.name}</h1>
            <div className="flex gap-4 mt-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><${Calendar} size=${12} className="text-emerald-500"/> ${new Date(selectedWorkout.date).toLocaleDateString('de-DE')}</span>
              <span className="flex items-center gap-1.5"><${Clock} size=${12} className="text-emerald-500"/> ${selectedWorkout.durationMinutes || 0} min</span>
            </div>
          </div>

          <div className="space-y-4">
            ${selectedWorkout.exercises.map((ex, idx) => html`
                <div key=${idx} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-lg">
                  <div className="p-5 bg-slate-800/30 border-b border-slate-800">
                      <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">${getExerciseName(ex.exerciseId)}</h3>
                  </div>
                  <div className="p-3 space-y-2">
                      ${ex.sets.map((set, sIdx) => html`
                        <div key=${set.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                            <div className="col-span-1 text-slate-700 font-black text-[10px]">${sIdx + 1}</div>
                            <div className="col-span-4 text-center font-bold text-white text-sm">${set.weight} <span className="text-[10px] text-slate-500 font-medium">kg</span></div>
                            <div className="col-span-4 text-center font-bold text-white text-sm">${set.reps} <span className="text-[10px] text-slate-500 font-medium">Wdh</span></div>
                            <div className="col-span-3 text-center text-emerald-400 font-black text-xs">${set.rir || 0}<span className="text-[8px] opacity-50 uppercase ml-0.5">R</span></div>
                        </div>
                      `)}
                  </div>
                </div>
            `)}
          </div>
        </main>
      </div>
    `;
  }

  if (sortedHistory.length === 0) {
    return html`
      <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
          <${Dumbbell} size=${40} className="opacity-20" />
        </div>
        <p className="font-bold text-sm uppercase tracking-widest">Noch keine Trainings</p>
      </div>
    `;
  }

  return html`
    <div className="space-y-4 pb-28">
      <header className="mb-6 px-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Verlauf</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Deine Reise</p>
      </header>
      
      ${sortedHistory.map(workout => html`
        <div 
          key=${workout.id} 
          onClick=${() => setSelectedWorkout(workout)}
          className="bg-slate-900 rounded-[32px] border border-slate-800 p-6 relative active:scale-[0.98] transition-all cursor-pointer group shadow-lg"
        >
          <button 
            type="button"
            onClick=${(e) => handleDelete(e, workout)}
            className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl active:bg-red-500/10 active:text-red-500 transition-all shadow-sm"
          >
            <${Trash2} size=${20} />
          </button>

          <div className="mb-4 pr-12">
            <h3 className="text-xl font-bold text-slate-100 group-active:text-emerald-400 transition-colors leading-tight">${workout.name}</h3>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                ${new Date(workout.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
               </span>
               <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                ${workout.durationMinutes || 0} min
               </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-wrap gap-1.5 flex-1">
                ${workout.exercises.slice(0, 3).map((ex, i) => html`
                <div key=${i} className="text-[9px] font-bold bg-slate-950/80 px-2.5 py-1.5 rounded-lg text-slate-400 border border-slate-800 max-w-[100px] truncate">
                    ${getExerciseName(ex.exerciseId)}
                </div>
                `)}
                ${workout.exercises.length > 3 && html`
                <div className="text-[9px] flex items-center justify-center text-slate-600 font-black px-1.5">
                    + ${workout.exercises.length - 3}
                </div>
                `}
            </div>
            <div className="w-8 h-8 flex items-center justify-center text-slate-700 group-hover:text-emerald-500 transition-colors ml-2">
              <${ArrowRight} size=${16} />
            </div>
          </div>
        </div>
      `)}
    </div>
  `;
};
