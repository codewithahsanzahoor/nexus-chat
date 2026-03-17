
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

export const getGeminiResponse = async (userPrompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "I'm sorry, I can't chat right now because the API key is missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: "You are Nexus Bot, a helpful and efficient assistant integrated into the Nexus Chat application. Keep responses concise, friendly, and tech-savvy. Use occasional emojis.",
      }
    });

    return response.text || "I processed that, but I don't have a specific answer.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong while thinking. Blame the latency! 🚀";
  }
};
