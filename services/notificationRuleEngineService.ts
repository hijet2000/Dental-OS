
import { UserRole, User } from "../types";
import { emailService } from "./emailService";
import { staffService } from "./staffService";
import { smsService } from "./smsService";
import { mergeTemplate } from "../utils";

type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';
type NotificationEvent = 'PAYMENT_FAILURE' | 'OVERDUE_COMPLIANCE' | 'UNSCHEDULED_CLOCK_IN' | 'ROTA_PUBLISHED';

interface NotificationRule {
    event: NotificationEvent;
    channel: NotificationChannel;
    recipientRole?: UserRole | 'ALL_ADMINS';
    recipient?: 'USER_IN_PAYLOAD'; // For rota publish
    template: string;
}

interface AppNotification {
    channel: 'IN_APP';
    message: string;
}

// In-memory store for rules
const notificationRules: NotificationRule[] = [
    { event: 'PAYMENT_FAILURE', channel: 'EMAIL', recipientRole: 'Admin', template: 'URGENT: Subscription payment failed for your ClinicOS account. Please update your billing details immediately.' },
    { event: 'PAYMENT_FAILURE', channel: 'IN_APP', recipientRole: 'Admin', template: 'Subscription payment failed. Please check your billing settings.' },
    { event: 'OVERDUE_COMPLIANCE', channel: 'IN_APP', recipientRole: 'ComplianceLead', template: 'Compliance document "{{documentName}}" is overdue.' },
    { event: 'UNSCHEDULED_CLOCK_IN', channel: 'IN_APP', recipientRole: 'Manager', template: 'Staff member {{userName}} clocked in but is not on the rota.' },
    { event: 'ROTA_PUBLISHED', channel: 'IN_APP', recipient: 'USER_IN_PAYLOAD', template: 'Your rota for the upcoming week has been published. Please review your shifts.' },
];

type Subscriber = (notification: AppNotification) => void;
let subscribers: Subscriber[] = [];

export const notificationRuleEngineService = {
    /**
     * Processes an event and triggers relevant notifications based on defined rules.
     * @param event The type of event that occurred.
     * @param payload Data related to the event to be used in templates.
     */
    // FIX: Make function async and await staffService calls
    processEvent: async (event: NotificationEvent, payload: Record<string, any>): Promise<void> => {
        console.log(`[NotificationEngine] Processing event: ${event}`, payload);
        const matchingRules = notificationRules.filter(rule => rule.event === event);

        // FIX: Use for...of loop to handle async operations inside
        for (const rule of matchingRules) {
            const message = mergeTemplate(rule.template, payload);
            
            let recipients: User[] = [];
            if (rule.recipientRole) {
                const users = await staffService.getUsers();
                recipients = users.filter(u => u.role === rule.recipientRole);
            } else if (rule.recipient === 'USER_IN_PAYLOAD' && payload.userId) {
                const user = await staffService.getUserById(payload.userId);
                if (user) recipients.push(user);
            }


            switch (rule.channel) {
                case 'IN_APP':
                    subscribers.forEach(sub => sub({ channel: 'IN_APP', message }));
                    break;
                case 'EMAIL':
                    recipients.forEach(user => emailService.send(user, `Notification: ${event}`, message));
                    break;
                case 'SMS':
                     recipients.forEach(user => smsService.send(user, message));
                    break;
            }
        }
    },

    /**
     * Subscribes a listener to IN_APP notifications.
     * @param callback The function to call when an IN_APP notification is dispatched.
     * @returns An unsubscribe function.
     */
    subscribe: (callback: Subscriber): () => void => {
        subscribers.push(callback);
        return () => {
            subscribers = subscribers.filter(sub => sub !== callback);
        };
    },
    
    getRules: (): NotificationRule[] => {
        return [...notificationRules];
    },
};
