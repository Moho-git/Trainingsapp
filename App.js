
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { LayoutDashboard, History as HistoryIcon, Dumbbell } from 'lucide-react';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './constants.js';

import { Dashboard } from './components/Dashboard.js';
import { ActiveWorkout } from './components/ActiveWorkout.js';
import { History } from './components/History.js';
import { Exercises } from './components/Exercises.js';

const html = htm.bind(React.createElement);

const BottomNav = ({ activeTab, onTabChange }) => html`
  <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40">
    <div className="flex justify-around items-center h-16 max-w-md mx-auto">
      <button 
        onClick=${() => onTabChange('dashboard')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/3 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${LayoutDashboard} className="w-6 h-6" />
        <span className="text-[10px] font-bold">Training</span>
      </button>
      <button 
        onClick=${() => onTabChange('exercises')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/3 ${activeTab === 'exercises' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${Dumbbell} className="w-6 h-6" />
        <span className="text-[10px] font-bold">Übungen</span>
      </button>
      <button 
        onClick=${() => onTabChange('history')} 
        className=${`flex flex-col items-center gap-1 p-2 w-1/3 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <${HistoryIcon} className="w-6 h-6" />
        <span className="text-[10px] font-bold">Verlauf</span>
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

  const [templates] = useState(DEFAULT_TEMPLATES);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kraftlog_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState(null);

  useEffect(() => {
    localStorage.setItem('kraftlog_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('kraftlog_exercises', JSON.stringify(exercises));
  }, [exercises]);

  const handleStartWorkout = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) setActiveWorkoutTemplate(template);
  };

  const handleFinishWorkout = (workout) => {
    setHistory(prev => [workout, ...prev]);
    setActiveWorkoutTemplate(null);
    setActiveTab('history');
  };

  const handleCancelWorkout = () => setActiveWorkoutTemplate(null);

  const handleDeleteWorkout = (id) => {
    if (window.confirm("Training unwiderruflich löschen?")) {
      setHistory(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleImportHistory = (importedHistory) => {
    setHistory(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        const newWorkouts = importedHistory.filter(w => !existingIds.has(w.id));
        return [...newWorkouts, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const handleAddExercise = (newEx) => {
    setExercises(prev => [...prev, { ...newEx, id: 'ex_' + Date.now() }]);
  };

  const handleUpdateExercise = (updatedEx) => {
    setExercises(prev => prev.map(ex => ex.id === updatedEx.id ? updatedEx : ex));
  };

  const handleDeleteExercise = (id) => {
    if (window.confirm("Übung wirklich löschen?")) {
      setExercises(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const renderContent = () => {
    if (activeWorkoutTemplate) {
      return html`<${ActiveWorkout}
        template=${activeWorkoutTemplate}
        allExercises=${exercises}
        history=${history}
        onFinish=${handleFinishWorkout}
        onCancel=${handleCancelWorkout}
      />`;
    }

    return html`
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
        <div className="max-w-md mx-auto min-h-screen p-6 relative">
          ${activeTab === 'dashboard' && html`
            <${Dashboard} 
              templates=${templates} 
              history=${history} 
              onStartWorkout=${handleStartWorkout} 
              onNavigateToHistory=${() => setActiveTab('history')}
              onImportHistory=${handleImportHistory}
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
          ${activeTab === 'history' && html`
            <${History} 
              history=${history} 
              exercises=${exercises}
              onDeleteWorkout=${handleDeleteWorkout}
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
