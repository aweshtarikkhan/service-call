import { GoogleGenerativeAI } from "@google/generative-ai";
import { SERVICES, CATEGORIES } from '../constants';

export interface RecommendationResult {
  recommendedCategory?: string;
  reasoning: string;
  suggestedServiceIds: string[];
}

// Your Gemini API Key hardcoded as requested
const GENAI_API_KEY = "AIzaSyA1zu5CJMoD68CLK03WeNnL1Hn44GSzFFI";

export const getServiceRecommendation = async (query: string): Promise<RecommendationResult> => {
  // Initialize the AI with your key
  const genAI = new GoogleGenerativeAI(GENAI_API_KEY);
  
  // Using gemini-1.5-flash for fast, reliable JSON responses
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

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
    4. Return valid JSON only.

    JSON Schema:
    {
      "recommendedCategory": string,
      "reasoning": string,
      "suggestedServiceIds": string[]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResult = JSON.parse(text || "{}");
    
    return {
      recommendedCategory: parsedResult.recommendedCategory,
      reasoning: parsedResult.reasoning || "Based on your search, we recommend checking our service catalog.",
      suggestedServiceIds: parsedResult.suggestedServiceIds || []
    };

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return {
      reasoning: "I'm having trouble connecting to the AI consultant. Please browse our manual categories.",
      suggestedServiceIds: []
    };
  }
};