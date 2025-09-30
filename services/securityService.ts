
// Fix: Corrected import path
import { SecurityPolicies } from '../types';

const STORAGE_KEY = 'securityPolicies';

const DEFAULT_POLICIES: SecurityPolicies = {
    enforceStrongPasswords: true,
    mfaEnabled: false,
    sessionTimeoutMinutes: 60,
    ipAllowlist: [],
};

export const securityService = {
    /**
     * Retrieves the current security policies from localStorage.
     * @returns The current security policies.
     */
    getPolicies: (): SecurityPolicies => {
        try {
            const savedPolicies = localStorage.getItem(STORAGE_KEY);
            return savedPolicies ? JSON.parse(savedPolicies) : DEFAULT_POLICIES;
        } catch (error) {
            console.error("Failed to parse security policies from storage", error);
            return DEFAULT_POLICIES;
        }
    },

    /**
     * Saves the updated security policies to localStorage.
     * @param policies The new policies to save.
     */
    savePolicies: (policies: SecurityPolicies): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
        } catch (error) {
            console.error("Failed to save security policies to storage", error);
        }
    },
};