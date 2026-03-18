import React, { useState, useEffect, useCallback } from 'react';
import htm from 'htm';
import { LayoutDashboard, History as HistoryIcon, Dumbbell, Scale, LogOut, AlertTriangle, Play, Activity, X } from 'lucide-react';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './constants.js';

import { Dashboard } from './components/Dashboard.js';
import { ActiveWorkout } from './components/ActiveWorkout.js';
import { History } from './components/History.js';
import { Exercises } from './components/Exercises.js';
import { Weight } from './components/Weight.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); // Track wo wir herkommen
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

  const [viewingSession, setViewingSession] = useState(null);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);

  // WICHTIG: Initialize navigation state properly
  useEffect(() => {
    // Clear any previous history
    window.history.replaceState({ 
      screen: 'dashboard',
      tab: 'dashboard',
      inWorkout: false 
    }, '');
  }, []);

  // BESSERE BACK-BUTTON LOGIK - Checke Browser-State, nicht React-State!
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state || {};
      
      console.log('🔙 Browser Back Button gedrückt. State:', state);

      // EBENE 1: Wenn Browser-State sagt inWorkout === true, aber React-State ist false
      // = Wir sind gerade aus dem Workout raus, gehen zum vorherigen State
      if (state.inWorkout === true && !isViewingActiveWorkout) {
        console.log('🔙 Back: Aus Workout-Mode');
        setActiveTab(state.tab || previousTab);
        return;
      }

      // EBENE 2: Wenn wir noch im Workout sind (React-State)
      if (isViewingActiveWorkout || workoutToEdit) {
        console.log('🔙 Back: Schließe Workout/Edit-Modus');
        setIsViewingActiveWorkout(false);
        setViewingSession(null);
        setWorkoutToEdit(null);
        return;
      }

      // EBENE 3: In einem Sub-Tab (nicht Dashboard)
      if (state.tab !== 'dashboard' && activeTab !== 'dashboard') {
        console.log('🔙 Back: Von Sub-Tab zum Dashboard');
        setActiveTab('dashboard');
        setPreviousTab('dashboard');
        return;
      }

      // EBENE 4: Im Dashboard → Zeige Exit-Bestätigung
      if (state.tab === 'dashboard' && activeTab === 'dashboard' && !isViewingActiveWorkout) {
        console.log('🔙 Back: Auf Dashboard - Exit-Bestätigung zeigen');
        setShowExitConfirm(true);
        window.history.pushState({ tab: 'dashboard', inWorkout: false }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, previousTab, isViewingActiveWorkout, workoutToEdit]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('kraftlog_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('kraftlog_exercises', JSON.stringify(exercises)); }, [exercises]);
  useEffect(() => { localStorage.setItem('kraftlog_weights', JSON.stringify(weightLogs)); }, [weightLogs]);
  useEffect(() => { localStorage.setItem('kraftlog_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => {
    if (activeWorkoutSession) {
      localStorage.setItem('kraftlog_active_session', JSON.stringify(activeWorkoutSession));
    } else {
      localStorage.removeItem('kraftlog_active_session');
    }
  }, [activeWorkoutSession]);

  // Handlers
  const deleteWorkout = useCallback((id) => {
    setHistory(prev => prev.filter(w => w.id !== id));
  }, []);

  const deleteWeightLog = useCallback((id) => {
    setWeightLogs(prev => prev.filter(w => w.id !== id));
  }, []);

  const abortActiveSession = useCallback(() => {
    if (window.confirm("Aktuelle Sitzung wirklich verwerfen? Alle ungespeicherten Daten gehen verloren.")) {
      setActiveWorkoutSession(null);
      setViewingSession(null);
      setIsViewingActiveWorkout(false);
    }
  }, []);

  const handleStartWorkoutTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setPreviousTab(activeTab);  // Speichern wo wir waren
      const newPreparation = {
        sessionId: Math.random().toString(36).substring(2, 15),
        templateId: template.id,
        name: template.name,
        isStarted: false,
        exercises: template.exercises.map(exId => ({
          exerciseId: exId,
          sets: [{ id: Math.random().toString(36).substring(2, 15), weight: 0, reps: 0, rir: 0, completed: false }]
        }))
      };
      setViewingSession(newPreparation);
      setIsViewingActiveWorkout(true);
      
      // WICHTIG: History-State beim Wechsel updaten
      window.history.pushState({ 
        screen: 'workout',
        tab: activeTab,
        inWorkout: true 
      }, '');
    }
  };

  const handleFinishWorkout = (workout) => {
    if (workoutToEdit) {
      setHistory(prev => prev.map(w => w.id === workoutToEdit.id ? { ...workout, id: workoutToEdit.id, date: workoutToEdit.date } : w));
      setWorkoutToEdit(null);
    } else {
      setHistory(prev => [workout, ...prev]);
      setActiveWorkoutSession(null);
      setViewingSession(null);
    }
    setIsViewingActiveWorkout(false);
    setActiveTab('history');
    
    // History-State aktualisieren
    window.history.pushState({ 
      screen: 'dashboard',
      tab: 'history',
      inWorkout: false 
    }, '');
  };

  const handleTabChange = (newTab) => {
    setPreviousTab(activeTab);  // Speichern wo wir jetzt sind (für Falls wir zurückgehen)
    setActiveTab(newTab);
    
    // History-State updaten wenn Tab wechselt
    window.history.pushState({ 
      screen: 'dashboard',
      tab: newTab,
      inWorkout: false 
    }, '');
  };

  const renderActiveView = () => {
    if (isViewingActiveWorkout || workoutToEdit) {
      return html`<${ActiveWorkout}
        session=${viewingSession}
        activeWorkoutSession=${activeWorkoutSession}
        editingWorkout=${workoutToEdit}
        allExercises=${exercises}
        history=${history}
        onUpdateSession=${(updated) => {
          setViewingSession(updated);
          if (activeWorkoutSession && updated.sessionId === activeWorkoutSession.sessionId) {
            setActiveWorkoutSession(updated);
          }
        }}
        onConfirmStart=${(session) => {
          setActiveWorkoutSession({ ...session, isStarted: true });
          setViewingSession({ ...session, isStarted: true });
        }}
        onFinish=${handleFinishWorkout}
        onCancel=${() => { 
          // Workout schließen: Ersetze Workout-State mit Dashboard-State
          setIsViewingActiveWorkout(false); 
          setViewingSession(null); 
          setWorkoutToEdit(null);
          // replaceState ersetzt den aktuellen State, statt einen neuen zu pushen
          window.history.replaceState({ 
            screen: 'dashboard',
            tab: activeTab,
            inWorkout: false 
          }, '');
        }}
        onAbortWorkout=${() => { 
          setActiveWorkoutSession(null);
          setViewingSession(null);
          setIsViewingActiveWorkout(false);
          // replaceState ersetzt den aktuellen State, statt einen neuen zu pushen
          window.history.replaceState({ 
            screen: 'dashboard',
            tab: activeTab,
            inWorkout: false 
          }, '');
        }}
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
              onContinueWorkout=${() => {
                setViewingSession(activeWorkoutSession);
                setIsViewingActiveWorkout(true);
                window.history.pushState({ screen: 'workout', tab: activeTab, inWorkout: true }, '');
              }}
              onAbortActiveSession=${abortActiveSession}
              onAddWeight=${(w, d) => setWeightLogs(prev => [...prev, { id: 'w_'+Date.now()+'_'+Math.random(), date: d || new Date().toISOString(), value: parseFloat(w) }].sort((a,b) => new Date(a.date)-new Date(b.date)))}
              onStartWorkout=${handleStartWorkoutTemplate} 
              onAddTemplate=${(name, exIds) => setTemplates(prev => [...prev, { id: 'tpl_'+Date.now(), name, exercises: exIds }])}
              onUpdateTemplate=${(t) => setTemplates(prev => prev.map(old => old.id === t.id ? t : old))}
              onDeleteTemplate=${(id) => { if(confirm("Löschen?")) setTemplates(prev => prev.filter(t => t.id !== id)) }}
              onImportBackup=${(backup) => {
                 if (backup.history) setHistory(prev => [...backup.history, ...prev.filter(w => !backup.history.find(bh => bh.id === w.id))]);
                 alert("Import erfolgreich");
              }}
            />
          `}
          ${activeTab === 'exercises' && html`
            <${Exercises} 
              exercises=${exercises}
              history=${history}
              onAdd=${(ex) => setExercises(prev => [...prev, {...ex, id: 'ex_'+Date.now()}])}
              onUpdate=${(ex) => setExercises(prev => prev.map(old => old.id === ex.id ? ex : old))}
              onDelete=${(id) => { if(confirm("Löschen?")) setExercises(prev => prev.filter(ex => ex.id !== id)) }}
            />
          `}
          ${activeTab === 'weight' && html`
            <${Weight} 
              weightLogs=${weightLogs}
              onAddWeight=${(w, d) => setWeightLogs(prev => [...prev, { id: 'w_'+Date.now()+'_'+Math.random(), date: d || new Date().toISOString(), value: parseFloat(w) }].sort((a,b) => new Date(a.date)-new Date(b.date)))}
              onUpdateWeight=${(w) => setWeightLogs(prev => prev.map(old => old.id === w.id ? w : old))}
              onDeleteWeight=${deleteWeightLog}
            />
          `}
          ${activeTab === 'history' && html`
            <${History} 
              history=${history} 
              exercises=${exercises}
              onDeleteWorkout=${deleteWorkout}
              onEditWorkout=${(w) => { setWorkoutToEdit(w); window.history.pushState({screen:'edit', inWorkout: true}, ''); }}
            />
          `}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40 h-16 shadow-2xl">
          <div className="flex justify-around items-center h-full max-w-md mx-auto">
            <button onClick=${() => handleTabChange('dashboard')} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${LayoutDashboard} size=${20} />
              <span className="text-[10px] font-bold">Training</span>
            </button>
            <button onClick=${() => handleTabChange('exercises')} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'exercises' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${Dumbbell} size=${20} />
              <span className="text-[10px] font-bold">Übungen</span>
            </button>
            <button onClick=${() => handleTabChange('weight')} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'weight' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${Scale} size=${20} />
              <span className="text-[10px] font-bold">Gewicht</span>
            </button>
            <button onClick=${() => handleTabChange('history')} className=${`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <${HistoryIcon} size=${20} />
              <span className="text-[10px] font-bold">Verlauf</span>
            </button>
          </div>
        </nav>

        <!-- Exit Confirmation Dialog -->
        ${showExitConfirm && html`
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 w-full max-w-xs text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <${LogOut} size=${32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">App beenden?</h3>
              <p className="text-slate-500 text-xs mb-8 leading-relaxed">Möchtest du KraftLog wirklich verlassen?</p>
              <div className="flex flex-col gap-3">
                <button onClick=${() => window.close()} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all">JA, BEENDEN</button>
                <button onClick=${() => setShowExitConfirm(false)} className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black active:scale-95 transition-all">WEITER TRACKEN</button>
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
