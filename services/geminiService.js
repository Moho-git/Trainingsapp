
import { GoogleGenAI } from "@google/genai";

export const analyzeProgress = async (history, exercises) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "KI nicht konfiguriert.";

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analysiere kurz: ${JSON.stringify(history.slice(0, 3))}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text;
  } catch (e) {
    return "Fehler.";
  }
};
