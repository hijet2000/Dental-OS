
import { UserRole } from '../types';

export interface AuditLogEvent {
    timestamp: Date;
    user: string;
    role: UserRole;
    action: string;
    details: Record<string, any>;
}

// In-memory store with more mock data for demonstration purposes
const auditLogs: AuditLogEvent[] = [
    {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
        user: 'Dr. Evelyn Reed',
        role: 'Admin',
        action: 'User role updated',
        details: { targetUserId: 'user-4', targetUserName: 'Brian Hall', oldRole: 'Hygienist', newRole: 'ComplianceLead' }
    },
    {
        timestamp: new Date(new Date().setHours(new Date().getHours() - 3)),
        user: 'system',
        role: 'Admin',
        action: 'AI Task Executed',
        details: { task: 'DAILY_BRIEF', latencyMs: '1203.45', simulatedCost: '$0.000045' }
    },
     {
        timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
        user: 'Charles Green',
        role: 'Manager',
        action: 'Inventory stock adjusted',
        details: { itemId: 'item-1', locationId: 'loc-2', quantityChange: -5 }
    },
    {
        timestamp: new Date(),
        user: 'Dr. Evelyn Reed',
        role: 'Admin',
        action: 'Security policy updated',
        details: { policy: 'sessionTimeoutMinutes', oldValue: 30, newValue: 60 }
    }
];

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