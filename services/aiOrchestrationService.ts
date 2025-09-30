
import { TASKS } from './aiServiceBus';
import { geminiService } from './geminiService';
import { auditLogService } from './auditLogService';
import {
    AITask,
    DailyBriefPayload,
    InventoryReorderPayload,
    LabChaseEmailPayload,
    ComplaintTriagePayload,
    SuggestRolePayload,
    AppAssistantPayload
} from '../types';

type TaskPayloadMap = {
    DAILY_BRIEF: DailyBriefPayload;
    INVENTORY_REORDER: InventoryReorderPayload;
    LAB_CHASE_EMAIL: LabChaseEmailPayload;
    COMPLAINT_TRIAGE: ComplaintTriagePayload;
    SUGGEST_ROLE: SuggestRolePayload;
    APP_ASSISTANT: AppAssistantPayload;
}

export const aiOrchestrationService = {
    /**
     * Runs a predefined AI task.
     * @param taskName The key of the task in the TASKS registry.
     * @param payload The data required for the task's prompt.
     * @returns A promise that resolves with the parsed JSON response from the AI.
     */
    async runTask<T, K extends keyof TaskPayloadMap>(taskName: K, payload: TaskPayloadMap[K]): Promise<T> {
        const task = TASKS[taskName] as AITask<TaskPayloadMap[K]>;
        if (!task) {
            throw new Error(`AI task "${taskName}" not found.`);
        }

        const startTime = performance.now();
        
        // 1. Redact PII/PHI if a redact function is provided
        const finalPayload = task.redact ? task.redact(payload) : payload;

        // 2. Generate the prompt
        const prompt = task.prompt(finalPayload);
        
        // 3. Call the Gemini service
        const response = await geminiService.generateContent({
            // As per guidelines, use gemini-2.5-flash
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: task.responseSchema,
            }
        });

        const endTime = performance.now();
        const latencyMs = (endTime - startTime).toFixed(2);
        
        // 4. Log the AI task execution for auditing
        auditLogService.log('system', 'Admin', 'AI Task Executed', { 
            task: taskName, 
            latencyMs,
            // A real app would calculate cost based on tokens
            simulatedCost: '$0.000045' 
        });

        // 5. Parse and return the response
        try {
            // As per guidelines, access the text property directly for the response.
            const jsonText = response.text.trim();
            // The response from a model with a responseSchema is a JSON string.
            return JSON.parse(jsonText) as T;
        } catch (error) {
            console.error("Failed to parse AI JSON response:", response.text, error);
            throw new Error("AI returned an invalid JSON response.");
        }
    },
};