import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAiInstance(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
      // We still need to return something to avoid breaking types, 
      // but we should avoid calling the constructor with undefined if it throws.
      // If it throws even with a dummy string, we might need a different approach.
    }
    // Only call constructor if we have a key, or use a placeholder that doesn't throw immediately
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "AI_KEY_NOT_SET" });
  }
  return aiInstance;
}

export const isAiAvailable = () => !!process.env.GEMINI_API_KEY;
