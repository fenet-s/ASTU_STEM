import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const getGeminiModel = () => {
  return genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [],
  });
};

// We'll use a more specific chat helper
export const startChat = (history: any[] = []) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are ASTU Support AI, a helpful assistant for students at Adama Science and Technology University (ASTU). You help students track their complaints, understand the status of their tickets, and provide information about university services. Be polite, professional, and concise. If a student asks about a specific ticket, refer to the data provided in their dashboard.",
    },
  });
};
