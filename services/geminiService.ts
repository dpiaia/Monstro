import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, WorkoutDay, UserProfile } from "../types";

// Declare process manually to avoid TypeScript errors in client-side code 
// if @types/node is missing or not included in the client tsconfig.
declare const process: {
  env: {
    API_KEY: string | undefined;
  }
};

// Helper to get AI instance safely.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Check your environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const analyzeEquipmentImage = async (base64Image: string): Promise<string> => {
    try {
        const ai = getAI();
        if (!ai) return "Erro de configuração da API.";

        const prompt = `
            Você é um personal trainer experiente do aplicativo 'Eu Monstro'.
            Analise esta imagem de um equipamento de academia.
            1. Identifique o nome da máquina ou equipamento.
            2. Liste os músculos principais trabalhados.
            3. Explique passo-a-passo, de forma concisa e segura, como executar o exercício corretamente nela.
            4. Dê uma dica de segurança importante ("Erro comum").
            
            Formate a resposta com quebras de linha claras e emojis para facilitar a leitura rápida no celular.
            Tom de voz: Encorajador e técnico.
        `;

        // Using Gemini 3 Pro Preview as requested for high quality image reasoning
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image
                        }
                    },
                    { text: prompt }
                ]
            }
        });

        return response.text || "Não consegui identificar o equipamento com clareza. Tente uma foto melhor iluminada.";
    } catch (error) {
        console.error("Image Analysis Error", error);
        return "Ocorreu um erro ao analisar a imagem. Verifique sua conexão.";
    }
};

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
            Analyze this list of gym exercises: ${JSON.stringify(exercises.map(e => ({id: e.id, name: e.name, sets: e.sets, reps: e.reps, load: e.load})))}.
            
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

export const generateFullRoutine = async (profile: UserProfile): Promise<WorkoutDay[]> => {
    try {
        const ai = getAI();
        if (!ai) return [];

        const goalMap = {
            'LOSE_WEIGHT': 'Weight Loss / Fat Burn',
            'GAIN_MUSCLE': 'Hypertrophy / Muscle Gain',
            'ENDURANCE': 'Cardio / Endurance',
            'STRENGTH': 'Strength / Powerlifting'
        };

        const prompt = `
            Create a weekly gym workout routine for a user with the following profile:
            - Goal: ${goalMap[profile.goal]}
            - Training Frequency: ${profile.workoutFrequency} days per week.
            - Level: Beginner/Intermediate.
            
            The output must adhere strictly to the schema provided.
            IMPORTANT: Use these specific IDs for days: 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'.
            Ensure 7 days are created.
            Mark rest days where isRestDay is true based on frequency.
            Language: Portuguese (PT-BR).
        `;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Day ID: mon, tue, wed, thu, fri, sat, sun" },
                    label: { type: Type.STRING, description: "Day label: Segunda, Terça..." },
                    muscleGroup: { type: Type.STRING, description: "Focus of the day or Rest" },
                    isRestDay: { type: Type.BOOLEAN },
                    exercises: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                equipment: { type: Type.STRING },
                                sets: { type: Type.NUMBER },
                                reps: { type: Type.STRING },
                                tips: { type: Type.STRING },
                            },
                            required: ["name", "equipment", "sets", "reps", "tips"]
                        }
                    }
                },
                required: ["id", "label", "muscleGroup", "isRestDay", "exercises"]
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) return [];
        
        const rawSchedule = JSON.parse(jsonText);

        // Hydrate with app-specific fields (ids, completion status, images)
        return rawSchedule.map((day: any) => ({
            ...day,
            modified: false,
            completed: false,
            score: 'PENDING',
            exercises: day.exercises.map((ex: any, idx: number) => ({
                ...ex,
                id: `${day.id}-ex-${idx}-${Date.now()}`,
                load: '0kg',
                imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`, // Placeholder
                completed: false
            }))
        }));

    } catch (error) {
        console.error("AI Generation Error", error);
        return [];
    }
}