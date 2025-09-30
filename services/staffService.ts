import { MOCK_USERS } from '../constants';
import { User, TimePunch, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { notificationRuleEngineService } from './notificationRuleEngineService';

let users: User[] = JSON.parse(JSON.stringify(MOCK_USERS));
let punches: TimePunch[] = [];

export const staffService = {
    getUsers: (): User[] => [...users],

    getUserById: (id: string): User | undefined => users.find(u => u.id === id),

    getUserByPin: (pin: string): User | undefined => users.find(u => u.pin === pin),
    
    updateUserRole: (userId: string, newRole: UserRole): User | undefined => {
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return undefined;
        users[index].role = newRole;
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

    addPunch: (userId: string, type: TimePunch['type'], isOffline: boolean): { success: boolean, message: string } => {
        const { status } = staffService.getUserStatus(userId);
        
        // Basic state validation
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
        
        const messages = {
            'clock-in': 'Clocked in successfully.',
            'clock-out': 'Clocked out successfully.',
            'break-start': 'Break started.',
            'break-end': 'Break ended.',
        }
        return { success: true, message: messages[type] };
    },
    
    getLiveStatuses: () => {
        return users.map(user => ({ user, status: staffService.getUserStatus(user.id) }));
    },

    checkAndTriggerAnomalyNotifications: () => {
        // This logic is now part of the Rota service, which has the full context.
        // A placeholder is left to not break imports.
    }
};