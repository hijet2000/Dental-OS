import { AILogEntry, AITaskType, Subscription } from '../types';
import { AI_TASK_CONFIG, PLANS_CONFIG, ADDONS_CONFIG } from '../constants';
import { generateStructuredContent } from './geminiService';
import { v4 as uuidv4 } from 'uuid';

// --- Service Bus State (in-memory for simulation) ---
let aiLogs: AILogEntry[] = [];
const aiCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// --- PHI Redaction ---
const redactPHI = (payload: any): any => {
    // In a real app, this would be a more robust library.
    // For this simulation, we'll just look for specific keys.
    if (!payload) return payload;
    const redactedPayload = { ...payload };
    if (redactedPayload.patientName) redactedPayload.patientName = '[REDACTED]';
    if (redactedPayload.name) redactedPayload.name = '[REDACTED]';
    return redactedPayload;
};


// --- Service Bus Core ---
class AIServiceBus {
    private logsUpdateCallback: ((logs: AILogEntry[]) => void) | null = null;

    public onLogsUpdate(callback: (logs: AILogEntry[]) => void) {
        this.logsUpdateCallback = callback;
    }

    private addLogEntry(entry: Omit<AILogEntry, 'id' | 'timestamp'>) {
        const newEntry: AILogEntry = {
            ...entry,
            id: uuidv4(),
            timestamp: new Date(),
        };
        aiLogs = [newEntry, ...aiLogs];
        this.logsUpdateCallback?.(aiLogs);
    }

    public getLogs = (): AILogEntry[] => aiLogs;
    public clearLogs = () => {
        aiLogs = [];
        this.logsUpdateCallback?.(aiLogs);
    };
    public clearCache = () => aiCache.clear();

    public async runTask<T>(
        taskType: AITaskType,
        payload: any,
        subscription: Subscription
    ): Promise<{ result: T, updatedSubscription: Subscription }> {
        const startTime = Date.now();
        const taskConfig = AI_TASK_CONFIG[taskType];
        
        // 1. Check Subscription Usage
        const planLimits = PLANS_CONFIG[subscription.plan].limits;
        const totalAddonAiCalls = Object.entries(subscription.purchasedAddons)
            .reduce((sum, [key, quantity]) => {
                const addonConfig = ADDONS_CONFIG[key as keyof typeof ADDONS_CONFIG];
                if (addonConfig && addonConfig.aiCalls) {
                    return sum + (addonConfig.aiCalls * Number(quantity));
                }
                return sum;
            }, 0);
        
        const totalAiCallLimit = planLimits.aiCalls + totalAddonAiCalls;

        if (subscription.usage.aiCalls >= totalAiCallLimit) {
            const errorMsg = 'AI call limit for your subscription plan has been reached.';
            this.addLogEntry({
                taskType,
                status: 'Error',
                latencyMs: Date.now() - startTime,
                cost: 0,
                inputPayload: payload,
                error: errorMsg,
            });
            throw new Error(errorMsg);
        }

        // 2. Caching
        const cacheKey = `${taskType}:${JSON.stringify(payload)}`;
        const cached = aiCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            this.addLogEntry({
                taskType,
                status: 'Cached',
                latencyMs: Date.now() - startTime,
                cost: 0,
                inputPayload: payload,
                outputData: cached.data,
            });
            return { result: cached.data as T, updatedSubscription: subscription };
        }

        // 3. Rate Limiting (Simulated)
        if (Math.random() < 0.05) { // 5% chance of being "rate limited"
            this.addLogEntry({
                taskType,
                status: 'RateLimited',
                latencyMs: Date.now() - startTime,
                cost: 0,
                inputPayload: payload,
                error: 'API rate limit exceeded.',
            });
            throw new Error('Rate limit exceeded. Please try again shortly.');
        }

        // 4. PHI Redaction
        const redactedPayload = redactPHI(payload);

        // 5. Execute Task
        try {
            const result = await generateStructuredContent(taskConfig, payload); // Pass original payload to Gemini
            const latencyMs = Date.now() - startTime;
            const simulatedCost = 0.001 + Math.random() * 0.002; 

            this.addLogEntry({
                taskType,
                status: 'Success',
                latencyMs,
                cost: simulatedCost,
                inputPayload: redactedPayload, // Log the redacted payload
                outputData: result,
            });

            aiCache.set(cacheKey, { timestamp: Date.now(), data: result });
            
            // 6. Prepare updated subscription state
            const updatedSubscription: Subscription = {
                ...subscription,
                usage: {
                    ...subscription.usage,
                    aiCalls: subscription.usage.aiCalls + 1,
                },
            };

            return { result: result as T, updatedSubscription };
        } catch (error: any) {
            this.addLogEntry({
                taskType,
                status: 'Error',
                latencyMs: Date.now() - startTime,
                cost: 0,
                inputPayload: redactedPayload,
                error: error.message || 'An unknown error occurred.',
            });
            throw error;
        }
    }
}

export const aiServiceBus = new AIServiceBus();
