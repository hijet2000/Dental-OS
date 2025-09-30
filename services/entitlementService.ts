


// Fix: Corrected import path
import { User } from '../types';

type Entitlement = 'ai:suggest-role' | 'ai:summarize-log';

export const entitlementService = {
    /**
     * Checks if a user has a specific entitlement.
     * In a real app, this would check against subscription plans, etc.
     * For this demo, we'll base it on user role.
     * @param user The user object.
     * @param entitlement The entitlement to check for.
     * @returns True if the user has the entitlement.
     */
    has: (user: User, entitlement: Entitlement): boolean => {
        switch (entitlement) {
            case 'ai:suggest-role':
            case 'ai:summarize-log':
                // FIX: Corrected role comparison to use valid UserRole types ('Admin', 'Manager') instead of non-existent ('ADMIN', 'EDITOR').
                // Only Admins and Managers get AI features
                return user.role === 'Admin' || user.role === 'Manager';
            default:
                return false;
        }
    },
};