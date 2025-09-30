

import { generateStructuredContent } from './geminiService';
// Fix: Corrected import path
import { TASKS } from './aiServiceBus';
import { auditLogService } from './auditLogService';

// --- Service Configuration ---
const CACHE_DURATION_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 10 requests per minute

// --- In-Memory Stores (for demonstration) ---
const cache = new Map<string, { data: any, timestamp: number }>();
const rateLimitTracker: { timestamp: number }[] = [];

/**
 * AI Orchestration Service
 *
 * This service acts as a centralized gateway for all AI tasks. It enhances the core AI provider
 * by adding crucial features for a production environment:
 *
 * - Caching: Reduces redundant API calls, lowering costs and latency.
 * - Rate Limiting: Prevents abuse and controls expenses.
 * - PHI Redaction: Ensures patient and staff privacy before sending data to the AI.
 * - Centralized Logging: Records AI usage, latency, and simulated costs for monitoring.
 * - Abstraction: Decouples components from the specific AI provider (Gemini), allowing for
 *   future flexibility (e.g., provider fallbacks, model changes).
 */
export const aiOrchestrationService = {
    /**
     * Executes a predefined AI task with robust production-ready features.
     * @param taskName The name of the task to run (e.g., 'DAILY_BRIEF').
     * @param payload The data required for the task's prompt.
     * @returns A promise that resolves with the parsed JSON response from the AI.
     */
    runTask: async <T>(taskName: keyof typeof TASKS, payload: any): Promise<T> => {
        const task = TASKS[taskName];
        if (!task) {
            // FIX: Explicitly convert taskName to string for error message.
            throw new Error(`AI task "${String(taskName)}" not found.`);
        }

        // 1. Caching
        // FIX: Explicitly convert taskName to string for cache key.
        const cacheKey = `${String(taskName)}:${JSON.stringify(payload)}`;
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
            // FIX: Explicitly convert taskName to string for logging.
            console.log(`[AI CACHE] HIT for task "${String(taskName)}"`);
            return cached.data as T;
        }

        // 2. Rate Limiting
        const now = Date.now();
        rateLimitTracker.push({ timestamp: now });
        // Clean up old requests outside the window
        while (rateLimitTracker.length > 0 && now - rateLimitTracker[0].timestamp > RATE_LIMIT_WINDOW_MS) {
            rateLimitTracker.shift();
        }
        if (rateLimitTracker.length > RATE_LIMIT_REQUESTS) {
            throw new Error('AI service rate limit exceeded. Please try again later.');
        }
        
        // 3. PHI Redaction
        const redactedPayload = task.redact ? task.redact(payload) : payload;

        const startTime = performance.now();
        try {
            // 4. Call the AI Provider
            const result = await generateStructuredContent(task, redactedPayload);
            const endTime = performance.now();
            
            // 5. Store in Cache
            cache.set(cacheKey, { data: result, timestamp: Date.now() });

            // 6. Logging & Metrics
            const latency = endTime - startTime;
            // In a real app, cost would be calculated based on token usage.
            const simulatedCost = (JSON.stringify(redactedPayload).length / 1000) * 0.0001;
            auditLogService.log('system', 'Admin', 'AI Task Executed', {
                task: taskName,
                model: 'gemini-2.5-flash',
                latencyMs: latency.toFixed(2),
                simulatedCost: `$${simulatedCost.toFixed(6)}`,
                inputPayload: redactedPayload,
                outputResult: result,
            });
            
            return result as T;

        } catch (error) {
            // FIX: Explicitly convert taskName to string for error message.
            console.error(`Error running AI task "${String(taskName)}":`, error);
            // In a production app, you might have provider fallback logic here.
            throw error;
        }
    },
};