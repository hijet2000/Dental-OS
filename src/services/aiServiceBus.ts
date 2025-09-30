import {
    AITask,
    DailyBriefPayload,
    InventoryReorderPayload,
    LabChaseEmailPayload,
    ComplaintTriagePayload,
    SuggestRolePayload,
    AppAssistantPayload
} from '../types';
import { Type } from '@google/genai';

// This file acts as a central registry for all predefined AI tasks in the application.
// Each task definition includes the prompt, the expected JSON response schema,
// and an optional function to redact Personally Identifiable Information (PII)
// or Protected Health Information (PHI) before sending the data to the AI.

type AITaskRegistry = {
    DAILY_BRIEF: AITask<DailyBriefPayload, {
        onDutyCount: number;
        lowStockCount: number;
        overdueComplianceCount: number;
        labsDueCount: number;
        openComplaintsCount: number;
    }>;
    INVENTORY_REORDER: AITask<InventoryReorderPayload>;
    LAB_CHASE_EMAIL: AITask<LabChaseEmailPayload>;
    COMPLAINT_TRIAGE: AITask<ComplaintTriagePayload>;
    SUGGEST_ROLE: AITask<SuggestRolePayload>;
    APP_ASSISTANT: AITask<AppAssistantPayload>;
}


export const TASKS: AITaskRegistry = {
    DAILY_BRIEF: {
        name: 'Daily Briefing',
        description: 'Generates a summary of the day\'s key metrics and priorities for an admin or manager.',
        prompt: (payload) => `
            You are an AI assistant for a dental practice manager. 
            Generate a concise daily briefing based on the following JSON data.
            The summary should be a short, friendly overview.
            The priorities should be a bulleted list of the most urgent items.
            Focus on alerts like low stock, overdue items, and open complaints.

            Data:
            ${JSON.stringify(payload)}
        `,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: 'A short, friendly overview of the day.' },
                priorities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of key action items for the day.' },
            }
        },
        redact: (payload: DailyBriefPayload) => {
            // In a real app, we'd remove patient names from complaints, etc.
            // For this demo, we'll just count them.
            return {
                onDutyCount: payload.onDuty.length,
                lowStockCount: payload.lowStock.length,
                overdueComplianceCount: payload.overdueCompliance.length,
                labsDueCount: payload.labsDue.length,
                openComplaintsCount: payload.openComplaints.length,
            };
        }
    },

    INVENTORY_REORDER: {
        name: 'Inventory Reorder Suggestion',
        description: 'Analyzes usage history for a low-stock item and suggests a reorder quantity.',
        prompt: (payload: InventoryReorderPayload) => `
            You are an inventory management AI. A stock item "${payload.itemName}" is low.
            Based on its recent usage history provided below (as JSON), suggest a smart reorder quantity.
            Assume a 2-week lead time for orders and aim to have a 4-week supply on hand after the order arrives.
            Today's date is ${new Date().toISOString().split('T')[0]}.

            Usage History:
            ${JSON.stringify(payload.usageHistory)}
        `,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                suggestedQuantity: { type: Type.INTEGER, description: 'The suggested number of units to reorder.' }
            }
        }
    },

    LAB_CHASE_EMAIL: {
        name: 'Lab Chase Email',
        description: 'Generates a polite but firm email to a dental lab about an overdue case.',
        prompt: (payload: LabChaseEmailPayload) => `
            You are a dental practice manager's assistant.
            Draft a professional email to a lab named "${payload.labName}" about an overdue lab case.
            The case is for a "${payload.caseType}" and it is ${payload.daysOverdue} day(s) overdue.
            The email should be polite but clearly ask for an immediate update on the status.
            Provide a subject line and a body for the email.
        `,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING, description: 'The suggested email subject line.' },
                body: { type: Type.STRING, description: 'The suggested email body content.' },
            }
        }
    },

    COMPLAINT_TRIAGE: {
        name: 'Complaint Triage',
        description: 'Analyzes a new patient complaint and suggests its severity, category, and an action plan.',
        prompt: (payload: ComplaintTriagePayload) => `
            You are a quality assurance AI for a dental practice.
            Analyze the following patient complaint and provide a structured triage assessment.
            Categorize it into one of: Clinical, Billing, or Staff Attitude.
            Assess the severity as one of: Low, Medium, or High.
            Provide a simple, 3-step action plan for the manager to follow.

            Complaint Description: "${payload.description}"
        `,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING, description: 'Suggested category (Clinical, Billing, Staff Attitude).' },
                severity: { type: Type.STRING, description: 'Suggested severity (Low, Medium, High).' },
                actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A 3-step action plan.' },
            }
        }
    },
    
    SUGGEST_ROLE: {
        name: 'Suggest Role',
        description: 'Suggests a new role for a staff member based on their activity.',
        prompt: (payload: SuggestRolePayload) => `
            You are a Human Resources AI assistant for a dental practice.
            A manager is considering changing the role for staff member "${payload.userName}", who is currently a "${payload.currentRole}".
            Based on the following (simulated) recent activity, suggest a new, more appropriate role from the available list.
            Provide a brief justification for your suggestion.
            Available roles: ${JSON.stringify(payload.availableRoles)}

            Recent Activity:
            - Completed 15 compliance checks, more than anyone else on the team.
            - Answered 5 patient billing queries successfully.
            - Frequently helps organize inventory without being asked.
        `,
         responseSchema: {
            type: Type.OBJECT,
            properties: {
                suggestedRole: { type: Type.STRING, description: 'The suggested role for the user.' },
                justification: { type: Type.STRING, description: 'A brief explanation for the suggestion.' },
            }
        }
    },

    APP_ASSISTANT: {
        name: 'In-App AI Assistant',
        description: 'Acts as a helpful chatbot that can answer questions about the app state and user permissions.',
        prompt: (payload: AppAssistantPayload) => `
            You are a helpful AI assistant embedded in a dental practice management app.
            Your name is ClinicOS AI.
            The user, ${payload.userName}, is a ${payload.userRole}.
            They are currently on the "${payload.currentPage}" page of the app.
            Their permissions are: [${payload.userPermissions.join(', ')}].
            Current app state: ${payload.lowStockCount} items are low on stock, ${payload.overdueComplianceCount} compliance documents are overdue.
            
            Answer the user's question concisely based on this context. Be helpful and aware of their role and permissions.
            If you don't know the answer or it's outside your scope, say so politely.

            User's question: "${payload.question}"
        `,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                answer: { type: Type.STRING, description: 'A helpful and context-aware answer to the user\'s question.'}
            }
        }
    }
};