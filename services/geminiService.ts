
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

// As per guidelines, the API key must be from process.env.API_KEY
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd have more robust error handling or a fallback.
  // For this project, we'll throw to make it clear configuration is missing.
  console.error("API_KEY environment variable not set. AI features will fail.");
}

// Initialize with a named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * A wrapper around the Gemini API for generating content, following project guidelines.
 */
export const geminiService = {
    /**
     * Generates content using the Gemini API.
     * @param params The parameters for the generateContent call.
     * @returns A promise that resolves with the generation result.
     */
    generateContent: async (params: GenerateContentParameters): Promise<GenerateContentResponse> => {
        try {
            // As per guidelines, use 'gemini-2.5-flash' for general text tasks.
            const model = params.model || 'gemini-2.5-flash';
            const response = await ai.models.generateContent({ ...params, model });
            // As per guidelines, directly return the response object.
            return response;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            // Implement robust error handling as per guidelines
            if (error instanceof Error) {
                 throw new Error(`Failed to generate content from Gemini API: ${error.message}`);
            }
            throw new Error("An unknown error occurred while calling the Gemini API.");
        }
    },
};