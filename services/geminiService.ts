
import { GoogleGenAI } from "@google/genai";
import { CompletedWorkout, Exercise } from '../types.ts';

export const analyzeProgress = async (
  history: CompletedWorkout[], 
  exercises: Exercise[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return "AI-Coach ist in dieser Version nicht konfiguriert. Nutze KraftLog als rein lokalen Tracker.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const recentWorkouts = history.slice(0, 5).map(w => ({
    date: w.date,
    name: w.name,
    exercises: w.exercises.map(e => {
      const exName = exercises.find(ex => ex.id === e.exerciseId)?.name || 'Unknown';
      const bestSet = e.sets.length > 0 
        ? e.sets.reduce((max, curr) => curr.weight > max.weight ? curr : max, e.sets[0])
        : { weight: 0, reps: 0 };
      return `${exName}: Max ${bestSet?.weight || 0}kg x ${bestSet?.reps || 0}`;
    })
  }));

  const systemInstruction = `Du bist ein professioneller Powerlifting- und Bodybuilding-Coach.
Analysiere die Trainingsdaten meines Klienten und gib kurzes, prägnantes Feedback auf Deutsch zu:
1. Trainingskonsistenz.
2. Auffällige Kraftsteigerungen oder Plateaus.
3. Eine konkrete Empfehlung für das nächste Training.

Halte dich kurz und motivierend. Nutze Markdown für die Formatierung.`;

  const prompt = `Analysiere die folgenden letzten 5 Trainingseinheiten meines Klienten (JSON Format):
${JSON.stringify(recentWorkouts)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });
    return response.text || "Konnte keine Analyse erstellen.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Fehler bei der Verbindung zum AI Coach.";
  }
};
