
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
// Fix: Corrected import path
import { User, UserRole, SubscriptionPlan } from '../types';
// Fix: Corrected import path
import { MOCK_USERS } from '../constants';
// Fix: Corrected import path
import { auditLogService } from '../services/auditLogService';

interface AppContextType {
    currentUser: User;
    users: User[];
    subscriptionPlan: SubscriptionPlan;
    setCurrentUser: (user: User) => void;
    setSubscriptionPlan: (plan: SubscriptionPlan) => void;
    updateUserProfile: (userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) => void;
    updateUserRole: (userId: string, newRole: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers = MOCK_USERS;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('Pro');

    const updateUserProfile = useCallback((userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
        if (userId === currentUser.id) {
            setCurrentUser(prev => ({ ...prev, ...updates }));
        }
    }, [currentUser.id]);

    const updateUserRole = useCallback((userId: string, newRole: UserRole) => {
        let oldRole: UserRole | undefined;
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                oldRole = u.role;
                return { ...u, role: newRole };
            }
            return u;
        }));
        if (userId === currentUser.id) {
            setCurrentUser(prev => ({ ...prev, role: newRole }));
        }
        const targetUser = users.find(u => u.id === userId);
        if (targetUser) {
            auditLogService.log(currentUser.name, currentUser.role, 'User role updated', {
                targetUserId: userId,
                targetUserName: targetUser.name,
                oldRole,
                newRole,
            });
        }
    }, [currentUser.id, currentUser.name, currentUser.role, users]);

    const value = {
        currentUser,
        users,
        subscriptionPlan,
        setCurrentUser,
        setSubscriptionPlan,
        updateUserProfile,
        updateUserRole
    };

    return React.createElement(AppContext.Provider, { value }, children);
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};