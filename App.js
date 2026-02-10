
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { LayoutDashboard, History as HistoryIcon, Dumbbell, Scale } from 'lucide-react';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './constants.js';

import { Dashboard } from './components/Dashboard.js';
import { ActiveWorkout } from './components/ActiveWorkout.js';
import { History } from './components/History.js';
import { Exercises } from './components/Exercises.js';
import { Weight } from './components/Weight.js';

const html = htm.bind(React.createElement);

const BottomNav = ({ activeTab, onTabChange }) => html`
  <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40">
    <div className="flex justify-around items-center h-16 max-w-md mx-auto">
      <button 
        onClick=${() => onTabChange('dashboard')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/4 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${LayoutDashboard} className="w-5 h-5" />
        <span className="text-[9px] font-bold">Training</span>
      </button>
      <button 
        onClick=${() => onTabChange('exercises')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/4 ${activeTab === 'exercises' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${Dumbbell} className="w-5 h-5" />
        <span className="text-[9px] font-bold">Übungen</span>
      </button>
      <button 
        onClick=${() => onTabChange('weight')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/4 ${activeTab === 'weight' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${Scale} className="w-5 h-5" />
        <span className="text-[9px] font-bold">Gewicht</span>
      </button>
      <button 
        onClick=${() => onTabChange('history')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/4 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${HistoryIcon} className="w-5 h-5" />
        <span className="text-[9px] font-bold">Verlauf</span>
      </button>
    </div>
  </nav>
`;

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [exercises, setExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_exercises');
      return saved ? JSON.parse(saved) : DEFAULT_EXERCISES;
    } catch (e) {
      return DEFAULT_EXERCISES;
    }
  });

  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_weights');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_templates');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch (e) {
      return DEFAULT_TEMPLATES;
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState(null);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);

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

  const handleStartWorkout = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) setActiveWorkoutTemplate(template);
  };

  const handleFinishWorkout = (workout) => {
    if (workoutToEdit) {
      setHistory(prev => prev.map(w => w.id === workoutToEdit.id ? { ...workout, id: workoutToEdit.id, date: workoutToEdit.date } : w));
      setWorkoutToEdit(null);
    } else {
      setHistory(prev => [workout, ...prev]);
      setActiveWorkoutTemplate(null);
    }
    setActiveTab('history');
  };

  const handleCancelWorkout = () => {
    setActiveWorkoutTemplate(null);
    setWorkoutToEdit(null);
  };

  const handleDeleteWorkout = (id) => {
    if (window.confirm("Training unwiderruflich löschen?")) {
      setHistory(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleEditWorkout = (workout) => {
    setWorkoutToEdit(workout);
  };

  const handleImportBackup = (backup) => {
    if (backup.history) {
      setHistory(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        const newOnes = backup.history.filter(w => !existingIds.has(w.id));
        return [...newOnes, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
    if (backup.exercises) {
      setExercises(prev => {
        const existingIds = new Set(prev.map(ex => ex.id));
        const newOnes = backup.exercises.filter(ex => !existingIds.has(ex.id));
        return [...prev, ...newOnes];
      });
    }
    if (backup.templates) {
      setTemplates(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newOnes = backup.templates.filter(t => !existingIds.has(t.id));
        return [...prev, ...newOnes];
      });
    }
    alert("Backup erfolgreich importiert!");
  };

  const handleAddExercise = (newEx) => {
    const id = newEx.id || 'ex_' + Date.now();
    setExercises(prev => [...prev, { ...newEx, id }]);
    return id;
  };

  const handleUpdateExercise = (updatedEx) => {
    setExercises(prev => prev.map(ex => ex.id === updatedEx.id ? updatedEx : ex));
  };

  const handleDeleteExercise = (id) => {
    if (window.confirm("Übung wirklich löschen?")) {
      setExercises(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const handleAddWeight = (weight, date) => {
    const newEntry = {
      id: 'w_' + Date.now(),
      date: date || new Date().toISOString(),
      value: parseFloat(weight)
    };
    setWeightLogs(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleUpdateWeight = (updated) => {
    setWeightLogs(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleDeleteWeight = (id) => {
    if (window.confirm("Gewichtseintrag wirklich löschen?")) {
      setWeightLogs(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleAddTemplate = (name, exerciseIds) => {
    const newTpl = {
      id: 'tpl_' + Date.now(),
      name,
      exercises: exerciseIds
    };
    setTemplates(prev => [...prev, newTpl]);
  };

  const handleUpdateTemplate = (updatedTpl) => {
    setTemplates(prev => prev.map(t => t.id === updatedTpl.id ? updatedTpl : t));
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm("Trainingstag wirklich löschen?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const renderContent = () => {
    if (activeWorkoutTemplate || workoutToEdit) {
      return html`<${ActiveWorkout}
        template=${activeWorkoutTemplate || { id: workoutToEdit.templateId, name: workoutToEdit.name, exercises: workoutToEdit.exercises.map(e => e.exerciseId) }}
        editingWorkout=${workoutToEdit}
        allExercises=${exercises}
        history=${history}
        onFinish=${handleFinishWorkout}
        onCancel=${handleCancelWorkout}
        onAddExercise=${handleAddExercise}
        onUpdateTemplate=${handleUpdateTemplate}
      />`;
    }

    return html`
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
        <div className="max-w-md mx-auto min-h-screen p-6 relative">
          ${activeTab === 'dashboard' && html`
            <${Dashboard} 
              templates=${templates} 
              exercises=${exercises}
              history=${history} 
              weightLogs=${weightLogs}
              onAddWeight=${handleAddWeight}
              onStartWorkout=${handleStartWorkout} 
              onAddTemplate=${handleAddTemplate}
              onUpdateTemplate=${handleUpdateTemplate}
              onDeleteTemplate=${handleDeleteTemplate}
              onNavigateToHistory=${() => setActiveTab('history')}
              onImportBackup=${handleImportBackup}
            />
          `}
          ${activeTab === 'exercises' && html`
            <${Exercises} 
              exercises=${exercises}
              onAdd=${handleAddExercise}
              onUpdate=${handleUpdateExercise}
              onDelete=${handleDeleteExercise}
            />
          `}
          ${activeTab === 'weight' && html`
            <${Weight} 
              weightLogs=${weightLogs}
              onAddWeight=${handleAddWeight}
              onUpdateWeight=${handleUpdateWeight}
              onDeleteWeight=${handleDeleteWeight}
            />
          `}
          ${activeTab === 'history' && html`
            <${History} 
              history=${history} 
              exercises=${exercises}
              onDeleteWorkout=${handleDeleteWorkout}
              onEditWorkout=${handleEditWorkout}
            />
          `}
        </div>
        <${BottomNav} activeTab=${activeTab} onTabChange=${setActiveTab} />
      </div>
    `;
  };

  return renderContent();
};

export default App;
