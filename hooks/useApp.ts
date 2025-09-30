
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SubscriptionPlan } from '../types';
import { staffService } from '../services/staffService'; // Assuming this service can provide users

interface AppContextType {
    currentUser: User;
    users: User[];
    subscriptionPlan: SubscriptionPlan;
    setSubscriptionPlan: (plan: SubscriptionPlan) => void;
    updateUserProfile: (userId: string, updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // FIX: Initialize with empty array and fetch users in useEffect.
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('Enterprise');

    useEffect(() => {
        const fetchUsers = async () => {
            const initialUsers = await staffService.getUsers();
            setUsers(initialUsers);
            if (initialUsers.length > 0) {
                setCurrentUser(initialUsers[0]); // Default to first user, e.g., Admin
            }
        };
        fetchUsers();
    }, []);

    const updateUserProfile = (userId: string, updates: Partial<User>) => {
        const newUsers = users.map(u => (u.id === userId ? { ...u, ...updates } : u));
        setUsers(newUsers);
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => ({ ...prev!, ...updates }));
        }
    };

    // Render children only when currentUser is loaded to avoid downstream errors
    if (!currentUser) {
        return null;
    }

    const value = {
        currentUser,
        users,
        subscriptionPlan,
        setSubscriptionPlan,
        updateUserProfile,
    };

    return React.createElement(AppContext.Provider, { value }, children);
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
