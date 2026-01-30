
import React, { useState } from 'react';
import { CompletedWorkout, Exercise } from '../types';
import { analyzeProgress } from '../services/geminiService';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

interface CoachProps {
    history: CompletedWorkout[];
    exercises: Exercise[];
}

export const Coach: React.FC<CoachProps> = ({ history, exercises }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        // Fix: Removed redundant API key check as per guidelines (Assume pre-configured)
        if (history.length === 0) {
            setError("Bitte absolviere zuerst ein paar Trainings.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fix: analyzeProgress now handles its own API key retrieval from process.env
            const result = await analyzeProgress(history, exercises);
            setAnalysis(result);
        } catch (e) {
            setError("Fehler bei der Analyse.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
             <header className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Bot className="w-8 h-8 text-indigo-400" /> AI Coach
                </h1>
                <p className="text-slate-400">Lass deine Trainingsdaten von Gemini analysieren.</p>
            </header>

            {!analysis && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                    <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Bereit zur Analyse?</h3>
                    <p className="text-slate-400 mb-6">
                        Der Coach schaut sich deine letzten 5 Trainings an und gibt Feedback zu Volumen, Intensität und Fortschritt.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        {loading ? 'Analysiere...' : 'Jetzt analysieren'}
                    </button>
                    {error && (
                        <div className="mt-4 text-red-400 text-sm flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            )}

            {analysis && (
                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-2xl">
                    <div className="prose prose-invert prose-emerald max-w-none">
                        <div className="whitespace-pre-line text-slate-200 leading-relaxed">
                            {analysis}
                        </div>
                    </div>
                    <button 
                        onClick={() => setAnalysis(null)}
                        className="mt-6 text-sm text-indigo-400 hover:text-white underline"
                    >
                        Neue Analyse starten
                    </button>
                </div>
            )}
        </div>
    );
};
