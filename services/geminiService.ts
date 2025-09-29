import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AITask } from "../types";

// Initialize the Google Gemini API client.
// The API key is sourced from the `process.env.API_KEY` environment variable,
// which is assumed to be configured in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates structured JSON content using the Gemini API based on a given task configuration.
 * This function is now multimodal and can handle both text and image inputs.
 * @param task The AI task configuration containing the prompt and response schema.
 * @param payload The data to be injected into the prompt, may include image data.
 * @returns The generated and parsed JSON object.
 */
export const generateStructuredContent = async (task: AITask, payload: any): Promise<any> => {
    const prompt = task.prompt(payload);

    // Check for image data in the payload to construct a multimodal request
    const imagePart = payload.image && payload.imageMimeType
        ? {
              inlineData: {
                  mimeType: payload.imageMimeType,
                  data: payload.image,
              },
          }
        : null;

    const textPart = { text: prompt };

    // Use multipart content if an image is present, otherwise use the simple prompt string
    const contents = imagePart ? { parts: [textPart, imagePart] } : prompt;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents, // This now handles both string and multipart content
            config: {
                responseMimeType: "application/json",
                responseSchema: task.responseSchema,
            },
        });

        const text = response.text.trim();
        // The response from the API is a JSON string, so we parse it.
        return JSON.parse(text);

    } catch (error) {
        console.error(`Error generating content for task type: ${task.name}`, error);
        // In a real app, you'd have more robust error handling,
        // maybe classifying errors (e.g., API vs. parsing errors).
        throw new Error(`Failed to process AI task: ${task.name}.`);
    }
};