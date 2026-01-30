import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History as HistoryIcon, Dumbbell, Bot } from 'lucide-react';
import { CompletedWorkout, WorkoutTemplate, Exercise } from './types';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './constants';

import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { History } from './components/History';
import { Coach } from './components/Coach';

// Simple Tab Navigation Component
const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (t: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40">
    <div className="flex justify-around items-center h-16 max-w-md mx-auto">
      <button 
        onClick={() => onTabChange('dashboard')} 
        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px]">Home</span>
      </button>
      <button 
        onClick={() => onTabChange('history')} 
        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500'}`}
      >
        <HistoryIcon className="w-6 h-6" />
        <span className="text-[10px]">Verlauf</span>
      </button>
       <button 
        onClick={() => onTabChange('coach')} 
        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'coach' ? 'text-indigo-400' : 'text-slate-500'}`}
      >
        <Bot className="w-6 h-6" />
        <span className="text-[10px]">Coach</span>
      </button>
    </div>
  </nav>
);

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [templates] = useState<WorkoutTemplate[]>(DEFAULT_TEMPLATES);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState<WorkoutTemplate | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('kraftlog_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('kraftlog_history', JSON.stringify(history));
  }, [history]);

  const handleStartWorkout = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setActiveWorkoutTemplate(template);
    }
  };

  const handleFinishWorkout = (workout: CompletedWorkout) => {
    setHistory(prev => [workout, ...prev]);
    setActiveWorkoutTemplate(null);
    setActiveTab('history');
  };

  const handleCancelWorkout = () => {
    // Confirmation is now handled inside ActiveWorkout component to differentiate between setup and active phase
    setActiveWorkoutTemplate(null);
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm("Möchtest du dieses Training wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
      setHistory(prev => prev.filter(w => w.id !== id));
    }
  };

  // Merge imported history avoiding duplicates by ID
  const handleImportHistory = (importedHistory: CompletedWorkout[]) => {
    setHistory(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        // Only add workouts that don't already exist
        const newWorkouts = importedHistory.filter(w => !existingIds.has(w.id));
        // Combine and sort by date descending
        const combined = [...newWorkouts, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return combined;
    });
  };

  // If a workout is active, show the active workout screen (full screen modal style)
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

  // Main App Layout
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

        {activeTab === 'coach' && (
           <Coach history={history} exercises={exercises} />
        )}

      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;