import { MOCK_USERS } from '../constants';
import { User, TimePunch, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { notificationRuleEngineService } from './notificationRuleEngineService';

const USERS_STORAGE_KEY = 'dentalos_users';
const PUNCHES_STORAGE_KEY = 'dentalos_punches';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Load initial data from localStorage or fall back to mocks
let users: User[] = (() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
})();

let punches: TimePunch[] = (() => {
    const saved = localStorage.getItem(PUNCHES_STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];
    // Re-hydrate date objects
    return data.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
})();

const persistUsers = () => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const persistPunches = () => {
    localStorage.setItem(PUNCHES_STORAGE_KEY, JSON.stringify(punches));
};

export const staffService = {
    getUsers: async (): Promise<User[]> => {
        await simulateDelay(400);
        return [...users];
    },

    getUserById: async (id: string): Promise<User | undefined> => {
        await simulateDelay(50);
        return users.find(u => u.id === id);
    },

    getUserByPin: async (pin: string): Promise<User | undefined> => {
        await simulateDelay(100);
        return users.find(u => u.pin === pin);
    },
    
    updateUserRole: async (userId: string, newRole: UserRole): Promise<User | undefined> => {
        await simulateDelay(250);
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return undefined;
        users[index].role = newRole;
        persistUsers();
        return users[index];
    },

    getUserStatus: (userId: string): { status: 'On Shift' | 'On Break' | 'Clocked Out', lastPunch?: TimePunch } => {
        const userPunches = punches
            .filter(p => p.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const lastPunch = userPunches[0];

        if (!lastPunch || lastPunch.type === 'clock-out') {
            return { status: 'Clocked Out', lastPunch };
        }
        if (lastPunch.type === 'break-start') {
            return { status: 'On Break', lastPunch };
        }
        return { status: 'On Shift', lastPunch };
    },

    addPunch: async (userId: string, type: TimePunch['type'], isOffline: boolean): Promise<{ success: boolean, message: string }> => {
        await simulateDelay(300);
        const { status } = staffService.getUserStatus(userId);
        
        if (type === 'clock-in' && status !== 'Clocked Out') return { success: false, message: 'You are already clocked in.' };
        if (type === 'clock-out' && status === 'Clocked Out') return { success: false, message: 'You are already clocked out.' };
        if (type === 'break-start' && status !== 'On Shift') return { success: false, message: 'You must be on shift to start a break.' };
        if (type === 'break-end' && status !== 'On Break') return { success: false, message: 'You are not currently on a break.' };
        
        const newPunch: TimePunch = {
            id: uuidv4(),
            userId,
            type,
            timestamp: new Date(),
            isOffline,
        };
        punches.push(newPunch);
        persistPunches();
        
        const messages = {
            'clock-in': 'Clocked in successfully.',
            'clock-out': 'Clocked out successfully.',
            'break-start': 'Break started.',
            'break-end': 'Break ended.',
        }
        return { success: true, message: messages[type] };
    },
    
    getLiveStatuses: async (): Promise<any[]> => {
        await simulateDelay(200);
        return users.map(user => ({ user, status: staffService.getUserStatus(user.id) }));
    },

    checkAndTriggerAnomalyNotifications: () => {
        // This logic is now part of the Rota service, which has the full context.
        // A placeholder is left to not break imports.
    }
};