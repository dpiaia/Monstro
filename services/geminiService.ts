import { GoogleGenAI } from "@google/genai";
import { Exercise } from "../types";

// Declare process manually to avoid TypeScript errors in client-side code 
// if @types/node is missing or not included in the client tsconfig.
declare const process: {
  env: {
    API_KEY: string | undefined;
  }
};

// Helper to get AI instance safely.
// This prevents the app from crashing with a white/black screen on startup 
// if the API_KEY environment variable is missing in Vercel.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Check your environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const getMotivationalTip = async (muscleGroup: string): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "Foco total hoje. Sem desculpas.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a short, intense, one-sentence motivational tip for a gym goer training ${muscleGroup} today. Keep it under 20 words. Tone: Personal Trainer, tough love.`,
    });
    return response.text?.trim() || "Foco total hoje. Sem desculpas.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Foco total hoje. Sem desculpas.";
  }
};

export const getPostWorkoutFeedback = async (score: string, muscleGroup: string): Promise<string> => {
    try {
        const ai = getAI();
        if (!ai) return "Bom trabalho. Continue consistente.";

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `The user just finished a ${muscleGroup} workout. Their performance score was ${score} (GOOD=Perfect, MEDIUM=Modified, BAD=Skipped/Poor). Give a 2-sentence feedback.`,
        });
        return response.text?.trim() || "Bom trabalho. Continue consistente.";
    } catch (error) {
        return "Bom trabalho. Continue consistente.";
    }
}

export const getWorkoutAdaptation = async (exercises: Exercise[], difficulty: 'EASY' | 'HARD' = 'HARD'): Promise<any[]> => {
    try {
        const ai = getAI();
        if (!ai) return [];

        const prompt = `
            Analyze this list of gym exercises: ${JSON.stringify(exercises.map(e => ({id: e.id, name: e.name, sets: e.sets, reps: e.reps})))}.
            
            The user wants to Adapt/Optimize this workout. ${difficulty === 'HARD' ? 'Make it harder (progressive overload).' : 'Make it slightly easier.'}
            
            Return a JSON ARRAY ONLY. Each item in the array must look like this:
            {
                "id": "exercise_id_from_input",
                "suggestedReps": "new rep range string",
                "suggestedSets": number,
                "reason": "short explanation"
            }
            
            Only suggest changes for 2 or 3 key exercises, not all of them.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const jsonText = response.text?.trim();
        if (!jsonText) return [];
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("AI Adaptation Error", error);
        return [];
    }
}