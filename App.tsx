
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History as HistoryIcon } from 'lucide-react';
import { CompletedWorkout, WorkoutTemplate, Exercise } from './types.ts';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './constants.ts';

import { Dashboard } from './components/Dashboard.tsx';
import { ActiveWorkout } from './components/ActiveWorkout.tsx';
import { History } from './components/History.tsx';

const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (t: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40">
    <div className="flex justify-around items-center h-16 max-w-md mx-auto">
      <button 
        onClick={() => onTabChange('dashboard')} 
        className={`flex flex-col items-center gap-1 p-2 w-1/2 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px] font-bold">Training</span>
      </button>
      <button 
        onClick={() => onTabChange('history')} 
        className={`flex flex-col items-center gap-1 p-2 w-1/2 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <HistoryIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold">Verlauf</span>
      </button>
    </div>
  </nav>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [templates] = useState<WorkoutTemplate[]>(DEFAULT_TEMPLATES);
  
  // Initialisiere History direkt aus dem LocalStorage, um Flackern zu vermeiden
  const [history, setHistory] = useState<CompletedWorkout[]>(() => {
    try {
      const saved = localStorage.getItem('kraftlog_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse initial history", e);
      return [];
    }
  });

  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState<WorkoutTemplate | null>(null);

  // Speicher-Sync Effekt
  useEffect(() => {
    localStorage.setItem('kraftlog_history', JSON.stringify(history));
  }, [history]);

  const handleStartWorkout = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) setActiveWorkoutTemplate(template);
  };

  const handleFinishWorkout = (workout: CompletedWorkout) => {
    setHistory(prev => [workout, ...prev]);
    setActiveWorkoutTemplate(null);
    setActiveTab('history');
  };

  const handleCancelWorkout = () => setActiveWorkoutTemplate(null);

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm("Training unwiderruflich löschen?")) {
      setHistory(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleImportHistory = (importedHistory: CompletedWorkout[]) => {
    setHistory(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        const newWorkouts = importedHistory.filter(w => !existingIds.has(w.id));
        const combined = [...newWorkouts, ...prev];
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  if (activeWorkoutTemplate) {
    return (
      <ActiveWorkout
        template={activeWorkoutTemplate}
        allExercises={exercises}
        history={history}
        onFinish={handleFinishWorkout}
        onCancel={handleCancelWorkout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-16">
      <div className="max-w-md mx-auto min-h-screen p-6 relative">
        {activeTab === 'dashboard' && (
          <Dashboard 
            templates={templates} 
            history={history} 
            onStartWorkout={handleStartWorkout} 
            onNavigateToHistory={() => setActiveTab('history')}
            onImportHistory={handleImportHistory}
          />
        )}
        {activeTab === 'history' && (
          <History 
            history={history} 
            exercises={exercises}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
