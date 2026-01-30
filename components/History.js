
import React from 'react';
import htm from 'htm';
import { Trash2 } from 'lucide-react';

const html = htm.bind(React.createElement);

export const History = ({ history, exercises, onDeleteWorkout }) => {
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedHistory.length === 0) {
    return html`<div className="text-center text-slate-500 p-20">Keine Trainings vorhanden.</div>`;
  }

  return html`
    <div className="space-y-4 pb-20">
      <h2 className="text-2xl font-bold text-white mb-4">Verlauf</h2>
      ${sortedHistory.map(workout => html`
        <div key=${workout.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 relative">
          <button onClick=${() => onDeleteWorkout(workout.id)} className="absolute top-4 right-4 text-slate-500"><${Trash2} size=${20} /></button>
          <h3 className="text-lg font-bold">${workout.name}</h3>
          <div className="flex gap-3 text-xs text-slate-400 mb-4">
            <span>${new Date(workout.date).toLocaleDateString()}</span>
            <span>${workout.durationMinutes} min</span>
          </div>
          <div className="space-y-1">
            ${workout.exercises.map((ex, i) => html`
              <div key=${i} className="text-sm flex justify-between border-b border-slate-800 pb-1">
                <span>${exercises.find(e => e.id === ex.exerciseId)?.name}</span>
                <span className="text-emerald-400">${ex.sets.length} Sätze</span>
              </div>
            `)}
          </div>
        </div>
      `)}
    </div>
  `;
};
