
import { GoogleGenAI, Type } from "@google/genai";
import { SERVICES, CATEGORIES } from '../constants';

export interface RecommendationResult {
  recommendedCategory?: string;
  reasoning: string;
  suggestedServiceIds: string[];
}

export const getServiceRecommendation = async (query: string): Promise<RecommendationResult> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const serviceList = SERVICES.map(s => ({ 
    id: s.id, 
    name: s.name, 
    description: s.description, 
    category: s.category 
  }));
  
  const prompt = `
    You are a professional service consultant for "Service on Call".
    
    User Problem: "${query}"
    
    Categories: ${JSON.stringify(CATEGORIES)}
    Services: ${JSON.stringify(serviceList)}

    TASK:
    1. Think deeply about the user's issue.
    2. Recommend the best Category and specific Service IDs.
    3. Provide reasoning that explains "Which service can do what" for their specific problem.
    4. Return valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // UPGRADED to Gemini 3 Pro
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Enabled Reasoning/Thinking for better service matching
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedCategory: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            suggestedServiceIds: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["reasoning", "suggestedServiceIds"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      recommendedCategory: result.recommendedCategory,
      reasoning: result.reasoning || "Based on your search, we recommend checking our service catalog.",
      suggestedServiceIds: result.suggestedServiceIds || []
    };

  } catch (error) {
    console.error("Thinking Model Error:", error);
    return {
      reasoning: "Based on your search, we recommend checking our service catalog.",
      suggestedServiceIds: []
    };
  }
};
