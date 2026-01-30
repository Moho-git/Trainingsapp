import React from 'react';
import { CompletedWorkout, Exercise } from '../types';
import { Calendar, Clock, Dumbbell, History as HistoryIcon, Trash2 } from 'lucide-react';

interface HistoryProps {
  history: CompletedWorkout[];
  exercises: Exercise[];
  onDeleteWorkout: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ history, exercises, onDeleteWorkout }) => {
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <HistoryIcon className="w-12 h-12 mb-4 opacity-50" />
        <p>Noch keine Trainings absolviert.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-2xl font-bold text-white mb-4">Verlauf</h2>
      {sortedHistory.map(workout => (
        <div key={workout.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors relative group">
          
          {/* Delete Button - Increased Z-Index and Hit Area */}
          <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteWorkout(workout.id);
            }}
            className="absolute top-2 right-2 z-10 text-slate-500 hover:text-red-500 hover:bg-red-950/30 p-3 rounded-full transition-all"
            title="Training löschen"
            aria-label="Training löschen"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex justify-between items-start mb-3 pr-10">
            <div>
              <h3 className="text-lg font-bold text-white">{workout.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(workout.date).toLocaleDateString('de-DE')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {workout.durationMinutes} min
                </span>
                 <span className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} Sätze
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {workout.exercises.slice(0, 3).map((ex, i) => {
               const exName = exercises.find(e => e.id === ex.exerciseId)?.name || 'Unknown';
               const bestSet = ex.sets.reduce((max, cur) => (cur.weight * cur.reps > max.weight * max.reps) ? cur : max, ex.sets[0]);
               
               return (
                <div key={i} className="flex justify-between text-sm border-b border-slate-800/50 pb-1 last:border-0">
                  <span className="text-slate-300 truncate w-2/3">{exName}</span>
                  <span className="text-emerald-400 font-mono">
                    {bestSet ? `${bestSet.weight}kg x ${bestSet.reps}` : '-'}
                  </span>
                </div>
               );
            })}
            {workout.exercises.length > 3 && (
              <div className="text-xs text-center text-slate-500 pt-1">
                + {workout.exercises.length - 3} weitere Übungen
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};