import { Type } from '@google/genai';
import {
    UserRole, PermissionKey, AITask, AITaskType, SubscriptionPlan, AddonKey, BrandingSettings,
    SecuritySettings, NotificationTrigger, NotificationChannel, Subscription
} from './types';

// --- RBAC (Role-Based Access Control) Configuration ---

export const ALL_USER_ROLES = Object.values(UserRole);

export const ROLES_CONFIG: Record<UserRole, { permissions: Set<PermissionKey> }> = {
    [UserRole.ADMIN]: {
        permissions: new Set(Object.values(PermissionKey)), // Admin has all permissions
    },
    [UserRole.MANAGER]: {
        permissions: new Set([
            PermissionKey.VIEW_DASHBOARD, PermissionKey.MANAGE_USERS, PermissionKey.VIEW_INVENTORY,
            PermissionKey.APPROVE_INVENTORY_ADJUSTMENTS, PermissionKey.RUN_INVENTORY_REPORTS, PermissionKey.VIEW_TASKS,
            PermissionKey.VERIFY_TASKS, PermissionKey.VIEW_APPOINTMENTS, PermissionKey.MANAGE_APPOINTMENTS, PermissionKey.VIEW_STAFF_LIST,
            PermissionKey.MANAGE_ROTA, PermissionKey.APPROVE_TIMEOFF, PermissionKey.EXPORT_PAYROLL, PermissionKey.VIEW_COMPLIANCE_TASKS,
            PermissionKey.EXPORT_COMPLIANCE_REPORTS, PermissionKey.VIEW_LAB_CASES, PermissionKey.MANAGE_LAB_CASES, PermissionKey.VIEW_COMPLAINTS,
            PermissionKey.MANAGE_COMPLAINTS, PermissionKey.MANAGE_NOTIFICATIONS,
        ]),
    },
    [UserRole.DENTIST]: {
        permissions: new Set([
            PermissionKey.VIEW_STAFF_DASHBOARD, PermissionKey.VIEW_APPOINTMENTS, PermissionKey.VIEW_LAB_CASES, PermissionKey.VIEW_COMPLAINTS,
        ]),
    },
    [UserRole.HYGIENIST]: {
        permissions: new Set([
            PermissionKey.VIEW_STAFF_DASHBOARD, PermissionKey.VIEW_APPOINTMENTS, PermissionKey.VIEW_TASKS, PermissionKey.COMPLETE_TASKS
        ]),
    },
    [UserRole.NURSE]: {
        permissions: new Set([
            PermissionKey.VIEW_STAFF_DASHBOARD, PermissionKey.VIEW_TASKS, PermissionKey.COMPLETE_TASKS, PermissionKey.COMPLETE_COMPLIANCE_TASKS,
            PermissionKey.USE_KIOSK, PermissionKey.VIEW_INVENTORY,
        ]),
    },
    [UserRole.RECEPTION]: {
        permissions: new Set([
            PermissionKey.VIEW_STAFF_DASHBOARD, PermissionKey.MANAGE_APPOINTMENTS, PermissionKey.USE_KIOSK, PermissionKey.MANAGE_COMPLAINTS,
        ]),
    },
    [UserRole.INVENTORY_LEAD]: {
        permissions: new Set([
            PermissionKey.VIEW_STAFF_DASHBOARD, PermissionKey.VIEW_INVENTORY, PermissionKey.MANAGE_INVENTORY_ITEMS, PermissionKey.MANAGE_EQUIPMENT,
            PermissionKey.RUN_INVENTORY_REPORTS,
        ]),
    },
    [UserRole.COMPLIANCE_LEAD]: {
        permissions: new Set([
            PermissionKey.VIEW_STAFF_DASHBOARD, PermissionKey.VIEW_COMPLIANCE_TASKS, PermissionKey.MANAGE_COMPLIANCE_LIBRARY,
            PermissionKey.EXPORT_COMPLIANCE_REPORTS,
        ]),
    },
    [UserRole.VIEWER]: {
        permissions: new Set([PermissionKey.VIEW_DASHBOARD]),
    },
};

// --- AI Task Definitions ---

export const AI_TASK_CONFIG: Record<AITaskType, AITask> = {
    [AITaskType.SUMMARIZE_MEETING_NOTES]: {
        name: 'Summarize Meeting Notes',
        description: 'Generates a concise summary from raw meeting notes.',
        prompt: (payload: { notes: string }) =>
            `Summarize the following meeting notes into key takeaways and action items. Keep the summary under 200 words. Notes: ${payload.notes}`,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["summary", "actionItems"],
        },
    },
    [AITaskType.GENERATE_PATIENT_EMAIL]: {
        name: 'Generate Patient Follow-up Email',
        description: 'Drafts a follow-up email to a patient based on visit details.',
        prompt: (payload: { patientName: string; visitReason: string; instructions: string }) =>
            `Draft a friendly and professional follow-up email to a patient named ${payload.patientName} regarding their recent visit for ${payload.visitReason}. Include the following instructions: ${payload.instructions}.`,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING },
            },
            required: ["subject", "body"],
        },
    },
    [AITaskType.ANALYZE_SENTIMENT]: {
        name: 'Analyze Feedback Sentiment',
        description: 'Analyzes patient feedback to determine its sentiment.',
        prompt: (payload: { feedback: string }) =>
            `Analyze the sentiment of the following feedback. Classify it as 'Positive', 'Negative', or 'Neutral'. Feedback: "${payload.feedback}"`,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                sentiment: { type: Type.STRING },
            },
            required: ["sentiment"],
        },
    },
    [AITaskType.ANALYZE_DENTAL_XRAY]: {
        name: 'Analyze Dental X-Ray',
        description: 'Analyzes a dental X-ray image and provides potential observations.',
        prompt: () =>
            `You are a helpful dental assistant AI. Analyze the provided dental X-ray image. Identify any potential anomalies, areas of concern, or notable features. Provide a summary and a list of specific observations. Do not provide a diagnosis.`,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["summary", "observations"],
        },
        requiresImage: true,
    },
    // Adding other AI tasks from modules
    [AITaskType.DAILY_BRIEFING]: {
        name: 'Generate Daily Briefing',
        description: 'Generates a morning huddle summary.',
        prompt: (payload) => `Generate a concise daily briefing summary for a dental practice manager based on this data: ${JSON.stringify(payload)}. Highlight key areas needing attention.`,
        responseSchema: { type: Type.OBJECT, properties: { briefing: { type: Type.STRING } }, required: ['briefing'] }
    },
    [AITaskType.NOSHOW_PREDICTION]: {
        name: 'Predict No-Show Risk',
        description: 'Predicts patient no-show risk.',
        prompt: (payload) => `Based on patient data: ${JSON.stringify(payload)}, predict the no-show risk as 'Low', 'Medium', or 'High' and provide a brief justification.`,
        responseSchema: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, justification: { type: Type.STRING } }, required: ['risk', 'justification'] }
    },
    [AITaskType.INVENTORY_REORDER]: {
        name: 'Suggest Inventory Reorder',
        description: 'Suggests optimal reorder points.',
        prompt: (payload) => `Analyze usage log for ${payload.itemName}: ${JSON.stringify(payload.usageLog)}. Suggest an optimized reorder point and target stock level.`,
        responseSchema: { type: Type.OBJECT, properties: { newReorderPoint: { type: Type.NUMBER }, newTargetStock: { type: Type.NUMBER }, reasoning: { type: Type.STRING } }, required: ['newReorderPoint', 'newTargetStock', 'reasoning'] }
    },
    [AITaskType.SCHEDULE_OPTIMIZATION]: {
        name: 'Optimize Staff Schedule',
        description: 'Suggests an optimized staff rota.',
        prompt: (payload) => `Optimize this weekly rota: ${JSON.stringify(payload.rota)}. Consider staff availability: ${JSON.stringify(payload.timeOff)}. Suggest changes to improve coverage.`,
        responseSchema: { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }, optimizedRota: { type: Type.STRING } }, required: ['suggestions'] }
    },
    [AITaskType.COMPLIANCE_REPORT_GEN]: {
        name: 'Generate Compliance Report',
        description: 'Generates a compliance summary report.',
        prompt: (payload) => `Generate a compliance summary report based on these task statuses: ${JSON.stringify(payload.tasks)}. Highlight overdue items and risks.`,
        responseSchema: { type: Type.OBJECT, properties: { report: { type: Type.STRING } }, required: ['report'] }
    },
     [AITaskType.COMPLIANCE_TASK_SUGGEST]: {
        name: 'Suggest Compliance Tasks',
        description: 'Suggests compliance tasks for a region.',
        prompt: (payload) => `Suggest a list of standard dental compliance tasks for the ${payload.region} region.`,
        responseSchema: { type: Type.OBJECT, properties: { tasks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { taskName: { type: Type.STRING }, frequency: { type: Type.STRING } } } } }, required: ['tasks'] }
    },
    [AITaskType.COMPLAINT_TRIAGE]: {
        name: 'Triage Patient Complaint',
        description: 'Suggests severity and steps for a complaint.',
        prompt: (payload) => `Triage this complaint: "${payload.description}". Suggest a severity ('low', 'medium', 'high') and initial resolution steps.`,
        responseSchema: { type: Type.OBJECT, properties: { severity: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['severity', 'steps'] }
    },
    [AITaskType.COMPLAINT_THEME_ANALYSIS]: {
        name: 'Analyze Complaint Themes',
        description: 'Identifies recurring themes in complaints.',
        prompt: (payload) => `Analyze these complaints to find recurring themes: ${JSON.stringify(payload.complaints)}`,
        responseSchema: { type: Type.OBJECT, properties: { themes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, count: { type: Type.NUMBER } } } } }, required: ['themes'] }
    },
    [AITaskType.LAB_CHASE_EMAIL]: {
        name: 'Generate Lab Chase Email',
        description: 'Drafts a polite email to a lab.',
        prompt: (payload) => `Draft a polite but firm chase email to ${payload.labName} for Case ID ${payload.caseId}, which was due on ${payload.dueDate}.`,
        responseSchema: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ['subject', 'body'] }
    },
};

// --- Subscription Plan Definitions ---

export const PLANS_CONFIG = {
    [SubscriptionPlan.FREE]: {
        