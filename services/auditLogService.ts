import { UserRole } from '../types';

export interface AuditLogEvent {
    timestamp: Date;
    user: string;
    role: UserRole;
    action: string;
    details: Record<string, any>;
}

// In-memory store for demonstration purposes
const auditLogs: AuditLogEvent[] = [];

/**
 * A placeholder for an audit logging service.
 * In a real application, this would send logs to a secure, persistent storage system.
 */
export const auditLogService = {
    /**
     * Records an audit event.
     * @param user The identifier of the user performing the action.
     * @param role The role of the user.
     * @param action A description of the action being performed.
     * @param details Any relevant data associated with the action.
     */
    log: (user: string, role: UserRole, action: string, details: Record<string, any>): void => {
        const event: AuditLogEvent = {
            timestamp: new Date(),
            user,
            role,
            action,
            details,
        };
        auditLogs.unshift(event); // Add to the beginning of the array
        console.log(`[AUDIT] User: ${user}, Action: ${action}`, details);
    },

    /**
     * Retrieves all recorded audit logs.
     * @returns An array of audit log events.
     */
    getLogs: (): AuditLogEvent[] => {
        return [...auditLogs];
    },
};
