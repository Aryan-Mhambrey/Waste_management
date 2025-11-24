import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize immediately, but handle missing key gracefully in calls
const ai = new GoogleGenAI({ apiKey });

export interface WasteAnalysis {
  category: 'DRY' | 'WET' | 'E-WASTE';
  confidence: number;
  safetyTips: string;
  estimatedWeightGuess: string;
}

export const analyzeWasteDescription = async (description: string): Promise<WasteAnalysis | null> => {
  if (!apiKey) {
    console.warn("API Key not found. Mocking response.");
    return {
        category: 'DRY',
        confidence: 0,
        safetyTips: "AI unavailable. Please categorize manually.",
        estimatedWeightGuess: "Unknown"
    };
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Analyze the following waste description: "${description}". 
    Categorize it strictly into one of these three: 'DRY', 'WET', 'E-WASTE'. 
    Provide a brief safety tip for handling this waste. 
    Guess an estimated weight (e.g., small, medium, heavy) based on the item.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['DRY', 'WET', 'E-WASTE'] },
            confidence: { type: Type.NUMBER },
            safetyTips: { type: Type.STRING },
            estimatedWeightGuess: { type: Type.STRING }
          },
          required: ['category', 'safetyTips', 'estimatedWeightGuess']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as WasteAnalysis;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};