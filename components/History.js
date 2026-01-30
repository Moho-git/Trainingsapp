
import React, { useState } from 'react';
import htm from 'htm';
import { Trash2, ChevronLeft, Calendar, Clock, Dumbbell, ArrowRight } from 'lucide-react';

const html = htm.bind(React.createElement);

export const History = ({ history, exercises, onDeleteWorkout }) => {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getExerciseName = (id) => exercises.find(e => e.id === id)?.name || 'Unbekannte Übung';

  if (selectedWorkout) {
    return html`
      <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col overflow-hidden">
        <header className="p-4 h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0 pt-safe">
          <button onClick=${() => setSelectedWorkout(null)} className="h-12 px-6 bg-slate-800 rounded-2xl flex items-center gap-2 font-bold text-white text-sm active:bg-slate-700">
            <${ChevronLeft} /> Zurück
          </button>
          <h2 className="font-bold text-white">Details</h2>
          <button onClick=${() => {
            if (window.confirm("Dieses Training aus dem Verlauf löschen?")) {
              onDeleteWorkout(selectedWorkout.id);
              setSelectedWorkout(null);
            }
          }} className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-500/10 rounded-xl active:bg-red-500/20">
            <${Trash2} size=${20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-10">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h1 className="text-2xl font-black text-white">${selectedWorkout.name}</h1>
            <div className="flex gap-4 mt-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1"><${Calendar} size=${12}/> ${new Date(selectedWorkout.date).toLocaleDateString('de-DE')}</span>
              <span className="flex items-center gap-1"><${Clock} size=${12}/> ${selectedWorkout.durationMinutes} min</span>
            </div>
          </div>

          <div className="space-y-4">
            ${selectedWorkout.exercises.map((ex, idx) => html`
                <div key=${idx} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-lg">
                <div className="p-5 bg-slate-800/30 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100">${getExerciseName(ex.exerciseId)}</h3>
                </div>
                <div className="p-4 space-y-2">
                    ${ex.sets.map((set, sIdx) => html`
                    <div key=${set.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <div className="col-span-1 text-slate-700 font-black text-[10px]">${sIdx + 1}</div>
                        <div className="col-span-4 text-center font-bold text-white">${set.weight} <span className="text-[10px] text-slate-500">kg</span></div>
                        <div className="col-span-4 text-center font-bold text-white">${set.reps} <span className="text-[10px] text-slate-500">Wdh</span></div>
                        <div className="col-span-3 text-center text-emerald-400 font-bold text-xs">${set.rir || 0} <span className="text-[8px] opacity-50 uppercase tracking-tighter">rir</span></div>
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
      <div className="text-center text-slate-500 p-20 flex flex-col items-center gap-4">
        <${Dumbbell} size=${40} className="opacity-20" />
        <p>Noch keine Trainings absolviert.</p>
      </div>
    `;
  }

  return html`
    <div className="space-y-4 pb-24">
      <header className="mb-6">
        <h2 className="text-3xl font-black text-white tracking-tight">Verlauf</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Deine Reise</p>
      </header>
      
      ${sortedHistory.map(workout => html`
        <div 
          key=${workout.id} 
          onClick=${() => setSelectedWorkout(workout)}
          className="bg-slate-900 rounded-[28px] border border-slate-800 p-5 relative active:scale-[0.98] transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-100 group-active:text-emerald-400">${workout.name}</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">${new Date(workout.date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest shadow-inner">
                ${workout.durationMinutes} min
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-wrap gap-2 flex-1">
                ${workout.exercises.slice(0, 3).map((ex, i) => html`
                <div key=${i} className="text-[10px] bg-slate-950/50 px-3 py-2 rounded-xl text-slate-400 truncate border border-slate-800/50">
                    ${getExerciseName(ex.exerciseId)}
                </div>
                `)}
                ${workout.exercises.length > 3 && html`
                <div className="text-[10px] flex items-center justify-center text-slate-600 font-bold px-2">
                    + ${workout.exercises.length - 3}
                </div>
                `}
            </div>
            <${ArrowRight} size=${16} className="text-slate-700 group-hover:text-emerald-500 transition-colors ml-4" />
          </div>
        </div>
      `)}
    </div>
  `;
};
