
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { LayoutDashboard, History as HistoryIcon, Dumbbell, Scale, LogOut, AlertTriangle, Play, Activity } from 'lucide-react';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './constants.js';

import { Dashboard } from './components/Dashboard.js';
import { ActiveWorkout } from './components/ActiveWorkout.js';
import { History } from './components/History.js';
import { Exercises } from './components/Exercises.js';
import { Weight } from './components/Weight.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isViewingActiveWorkout, setIsViewingActiveWorkout] = useState(false);
  
  const [exercises, setExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_exercises');
      return saved ? JSON.parse(saved) : DEFAULT_EXERCISES;
    } catch (e) { return DEFAULT_EXERCISES; }
  });

  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_weights');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_templates');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch (e) { return DEFAULT_TEMPLATES; }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [activeWorkoutSession, setActiveWorkoutSession] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [workoutToEdit, setWorkoutToEdit] = useState(null);

  // Navigation Logic for Back Button
  useEffect(() => {
    const handlePopState = (event) => {
      if (isViewingActiveWorkout) {
        setIsViewingActiveWorkout(false);
        window.history.pushState({ page: 'dashboard' }, '');
      } else if (workoutToEdit) {
        setWorkoutToEdit(null);
        window.history.pushState({ page: 'dashboard' }, '');
      } else if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        window.history.pushState({ page: 'dashboard' }, '');
      } else {
        setShowExitConfirm(true);
        window.history.pushState({ page: 'dashboard' }, '');
      }
    };

    window.history.replaceState({ page: 'dashboard' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, isViewingActiveWorkout, workoutToEdit]);

  useEffect(() => {
    localStorage.setItem('kraftlog_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('kraftlog_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('kraftlog_weights', JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    localStorage.setItem('kraftlog_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (activeWorkoutSession) {
      localStorage.setItem('kraftlog_active_session', JSON.stringify(activeWorkoutSession));
    } else {
      localStorage.removeItem('kraftlog_active_session');
    }
  }, [activeWorkoutSession]);

  const handleStartWorkout = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newSession = {
        templateId: template.id,
        name: template.name,
        isStarted: false,
        exercises: template.exercises.map(exId => ({
          exerciseId: exId,
          sets: [{ id: Math.random().toString(36).substring(2, 15), weight: 0, reps: 0, rir: 0, completed: false }]
        }))
      };
      setActiveWorkoutSession(newSession);
      setIsViewingActiveWorkout(true);
      window.history.pushState({ page: 'workout' }, '');
    }
  };

  const handleFinishWorkout = (workout) => {
    if (workoutToEdit) {
      setHistory(prev => prev.map(w => w.id === workoutToEdit.id ? { ...workout, id: workoutToEdit.id, date: workoutToEdit.date } : w));
      setWorkoutToEdit(null);
    } else {
      setHistory(prev => [workout, ...prev]);
      setActiveWorkoutSession(null);
    }
    setIsViewingActiveWorkout(false);
    setActiveTab('history');
  };

  const handleImportBackup = (backup) => {
    if (backup.history) setHistory(prev => {
      const existing = new Set(prev.map(w => w.id));
      return [...backup.history.filter(w => !existing.has(w.id)), ...prev].sort((a,b) => new Date(b.date) - new Date(a.date));
    });
    if (backup.exercises) setExercises(prev => {
      const existing = new Set(prev.map(ex => ex.id));
      return [...prev, ...backup.exercises.filter(ex => !existing.has(ex.id))];
    });
    if (backup.templates) setTemplates(prev => {
      const existing = new Set(prev.map(t => t.id));
      return [...prev, ...backup.templates.filter(t => !existing.has(t.id))];
    });
    if (backup.weightLogs) setWeightLogs(prev => {
      const existing = new Set(prev.map(w => w.id));
      return [...prev, ...backup.weightLogs.filter(w => !existing.has(w.id))].sort((a,b) => new Date(a.date) - new Date(b.date));
    });
    alert("Import abgeschlossen!");
  };

  const renderActiveView = () => {
    if (isViewingActiveWorkout || workoutToEdit) {
      return html`<${ActiveWorkout}
        session=${activeWorkoutSession}
        editingWorkout=${workoutToEdit}
        allExercises=${exercises}
        history=${history}
        onUpdateSession=${setActiveWorkoutSession}
        onFinish=${handleFinishWorkout}
        onCancel=${() => { setIsViewingActiveWorkout(false); setWorkoutToEdit(null); }}
        onAbortWorkout=${() => { setActiveWorkoutSession(null); setIsViewingActiveWorkout(false); }}
        onAddExercise=${(newEx) => {
          const id = 'ex_' + Date.now();
          setExercises(prev => [...prev, { ...newEx, id }]);
          return id;
        }}
        onUpdateTemplate=${(updatedTpl) => setTemplates(prev => prev.map(t => t.id === updatedTpl.id ? updatedTpl : t))}
      />`;
    }

    return html`
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-md mx-auto p-6">
          ${activeTab === 'dashboard' && html`
            <${Dashboard} 
              templates=${templates} 
              exercises=${exercises}
              history=${history} 
              weightLogs=${weightLogs}
              activeWorkoutSession=${activeWorkoutSession}
              onContinueWorkout=${() => setIsViewingActiveWorkout(true)}
              onAddWeight=${(w, d) => setWeightLogs(prev => [...prev, { id: 'w_'+Date.now(), date: d || new Date().toISOString(), value: parseFloat(w) }].sort((a,b) => new Date(a.date)-new Date(b.date)))}
              onStartWorkout=${handleStartWorkout} 
              onAddTemplate=${(name, exIds) => setTemplates(prev => [...prev, { id: 'tpl_'+Date.now(), name, exercises: exIds }])}
              onUpdateTemplate=${(t) => setTemplates(prev => prev.map(old => old.id === t.id ? t : old))}
              onDeleteTemplate=${(id) => { if(confirm("Löschen?")) setTemplates(prev => prev.filter(t => t.id !== id)) }}
              onImportBackup=${handleImportBackup}
            />
          `}
          ${activeTab === 'exercises' && html`
            <${Exercises} 
              exercises=${exercises}
              onAdd=${(ex) => setExercises(prev => [...prev, {...ex, id: 'ex_'+Date.now()}])}
              onUpdate=${(ex) => setExercises(prev => prev.map(old => old.id === ex.id ? ex : old))}
              onDelete=${(id) => { if(confirm("Löschen?")) setExercises(prev => prev.filter(ex => ex.id !== id)) }}
            />
          `}
          ${activeTab === 'weight' && html`
            <${Weight} 
              weightLogs=${weightLogs}
              onAddWeight=${(w, d) => setWeightLogs(prev => [...prev, { id: 'w_'+Date.now(), date: d || new Date().toISOString(), value: parseFloat(w) }].sort((a,b) => new Date(a.date)-new Date(b.date)))}
              onUpdateWeight=${(w) => setWeightLogs(prev => prev.map(old => old.id === w.id ? w : old))}
              onDeleteWeight=${(id) => { if(confirm("Löschen?")) setWeightLogs(prev => prev.filter(w => w.id !== id)) }}
            />
          `}
          ${activeTab === 'history' && html`
            <${History} 
              history=${history} 
              exercises=${exercises}
              onDeleteWorkout=${(id) => { if(confirm("Löschen?")) setHistory(prev => prev.filter(w => w.id !== id)) }}
              onEditWorkout=${(w) => { setWorkoutToEdit(w); window.history.pushState({page:'edit'}, ''); }}
            />
          `}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40 h-16 shadow-2xl">
          <div className="flex justify-around items-center h-full max-w-md mx-auto">
            <button onClick=${() => { setActiveTab('dashboard'); window.history.pushState({tab:'dashboard'}, ''); }} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${LayoutDashboard} size=${20} />
              <span className="text-[10px] font-bold">Training</span>
            </button>
            <button onClick=${() => { setActiveTab('exercises'); window.history.pushState({tab:'exercises'}, ''); }} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'exercises' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${Dumbbell} size=${20} />
              <span className="text-[10px] font-bold">Übungen</span>
            </button>
            <button onClick=${() => { setActiveTab('weight'); window.history.pushState({tab:'weight'}, ''); }} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'weight' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${Scale} size=${20} />
              <span className="text-[10px] font-bold">Gewicht</span>
            </button>
            <button onClick=${() => { setActiveTab('history'); window.history.pushState({tab:'history'}, ''); }} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${HistoryIcon} size=${20} />
              <span className="text-[10px] font-bold">Verlauf</span>
            </button>
          </div>
        </nav>

        ${showExitConfirm && html`
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 w-full max-w-xs text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-slate-800 text-slate-400">
                <${LogOut} size=${32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">App schließen?</h3>
              <p className="text-slate-400 mb-6 text-sm">Willst du die Anwendung wirklich verlassen?</p>
              <div className="flex flex-col gap-3">
                <button onClick=${() => { setShowExitConfirm(false); window.close(); }} className="w-full py-4 bg-emerald-600 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all">Ja, verlassen</button>
                <button onClick=${() => setShowExitConfirm(false)} className="w-full py-4 bg-slate-800 rounded-2xl font-bold text-slate-400 active:scale-95 transition-all">Abbrechen</button>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  };

  return renderActiveView();
};

export default App;
