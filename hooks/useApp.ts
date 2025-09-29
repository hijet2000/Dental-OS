import { useState, useEffect, useCallback } from 'react';
import { aiServiceBus } from '../services/aiServiceBus';
import { auditLogService } from '../services/auditLogService';
import {
    AILogEntry, AITaskType, Subscription, UserRole, SubscriptionPlan, InventoryItem, Equipment,
    TaskRun, Patient, Appointment, StaffMember, TimeOffRequest, RotaShift, ClockInEvent,
    ComplianceTaskRun, LabCase, Complaint, BrandingSettings, SecuritySettings, StoredFile,
    BackupRecord, Notification, NotificationTrigger, FeatureFlagId
} from '../types';
import { useNotifications } from '../components/Notification';
// Fix: Import MOCK_USERS from constants
import { DEFAULT_BRANDING_SETTINGS, DEFAULT_SECURITY_SETTINGS, MOCK_USERS } from '../constants';

const createInitialState = () => ({
    inventory: [
        { id: 'inv-1', name: 'Gloves (Box)', category: 'Consumables', stock: 20, reorderPoint: 10, targetStock: 50, supplierId: 'sup-1', qrCode: 'INV001', usageLog: [] },
        { id: 'inv-2', name: 'Dental Masks (Box)', category: 'Consumables', stock: 5, reorderPoint: 15, targetStock: 40, supplierId: 'sup-1', qrCode: 'INV002', usageLog: [] }
    ] as InventoryItem[],
    equipment: [
        { id: 'eq-1', name: 'X-Ray Machine', serialNumber: 'XRAY-123', purchaseDate: '2022-01-15', warrantyExpiry: '2025-01-15', serviceIntervalMonths: 6, lastServiceDate: '2023-12-20', qrCode: 'EQUIP001' }
    ] as Equipment[],
    tasks: [
        { id: 'task-1', defId: 'def-1', qrAreaId: 'area-1', dueDate: new Date(Date.now() - 86400000).toISOString(), status: 'overdue' },
        { id: 'task-2', defId: 'def-2', qrAreaId: 'area-2', dueDate: new Date().toISOString(), status: 'pending' }
    ] as TaskRun[],
    patients: [
        { id: 'pat-1', name: 'John Doe', noShowHistory: 1, totalAppointments: 10 },
        { id: 'pat-2', name: 'Jane Smith', noShowHistory: 5, totalAppointments: 8 }
    ] as Patient[],
    appointments: [
        { id: 'app-1', patientId: 'pat-1', time: '2024-08-01T10:00:00Z', type: 'Check-up', status: 'confirmed' },
        { id: 'app-2', patientId: 'pat-2', time: '2024-08-01T11:00:00Z', type: 'Cleaning', status: 'pending' }
    ] as Appointment[],
    staff: [
        { id: 'staff-1', name: 'Dr. Alan Grant', role: UserRole.DENTIST, pin: '1234', qrBadge: 'STAFF001' },
        { id: 'staff-2', name: 'Sarah Connor', role: UserRole.NURSE, pin: '4321', qrBadge: 'STAFF002' }
    ] as StaffMember[],
    timeOffRequests: [] as TimeOffRequest[],
    rota: [] as RotaShift[],
    clockIns: [] as ClockInEvent[],
    complianceTasks: [
        { id: 'ct-1', defId: 'cdef-1', dueDate: new Date(Date.now() - 86400000).toISOString(), status: 'overdue' },
        { id: 'ct-2', defId: 'cdef-2', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'due_soon' },
    ] as ComplianceTaskRun[],
    labCases: [
        { id: 'lc-1', patientName: 'John Doe', labId: 'lab-1', sentDate: '2024-07-15', dueDate: '2024-07-25', status: 'overdue' }
    ] as LabCase[],
    complaints: [
        { id: 'comp-1', patientName: 'Jane Smith', date: '2024-07-20', description: 'Long wait time', severity: 'medium', status: 'open' }
    ] as Complaint[],
    files: [ { id: 'file-1', name: 'patient_records_template.csv', size: 1024, type: 'CSV', uploadedAt: new Date().toISOString() }] as StoredFile[],
    backups: [{ id: 'bak-1', timestamp: new Date(Date.now() - 86400000).toISOString(), size: 10485760, status: 'completed' }] as BackupRecord[],
    notifications: [] as Notification[],
    featureFlags: { newDashboardBeta: false } as Record<FeatureFlagId, boolean>,
});


export const useApp = () => {
    const { addNotification } = useNotifications();
    
    // --- User & Auth State ---
    const [currentUser, setCurrentUser] = useState('manager@example.com');
    const [role, setRole] = useState<UserRole>(MOCK_USERS[currentUser].role);
    const [subscription, setSubscription] = useState<Subscription>(MOCK_USERS[currentUser].subscription);
    
    // --- Global App State ---
    const [appState, setAppState] = useState(createInitialState);
    const [aiLogs, setAiLogs] = useState<AILogEntry[]>([]);
    const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING_SETTINGS);
    const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);

    useEffect(() => {
        aiServiceBus.onLogsUpdate(setAiLogs);
        setAiLogs(aiServiceBus.getLogs());
    }, []);

    useEffect(() => {
        const userData = MOCK_USERS[currentUser];
        setRole(userData.role);
        setSubscription(userData.subscription);
    }, [currentUser]);

    const handleUserChange = (email: string) => {
        setCurrentUser(email);
        aiServiceBus.clearLogs();
        aiServiceBus.clearCache();
    };
    
    const handleClearLogs = () => {
        aiServiceBus.clearLogs();
        addNotification({ type: 'info', message: 'AI logs cleared.' });
        auditLogService.log(currentUser, role, 'Clear AI Logs', {});
    };

    const runAiTask = useCallback(async (taskType: AITaskType, payload: any) => {
        const { result, updatedSubscription } = await aiServiceBus.runTask(
            taskType,
            payload,
            subscription
        );
        setSubscription(updatedSubscription);
        auditLogService.log(currentUser, role, 'Run AI Task', { task: taskType });
        return result;
    }, [subscription, currentUser, role]);

    const clearAiCache = () => {
        aiServiceBus.clearCache();
        addNotification({type: 'info', message: 'AI cache cleared.'});
    };
    
    const addAppNotification = (trigger: NotificationTrigger, payload: any) => {
        // This would use the notification service to generate and push a notification
        const newNotif: Notification = {
            id: `notif-${Date.now()}`,
            trigger,
            message: `${trigger}: ${JSON.stringify(payload)}`,
            timestamp: new Date(),
            read: false
        };
        setAppState(prev => ({...prev, notifications: [newNotif, ...prev.notifications]}));
    };

    const seedDemoData = () => {
        setAppState(createInitialState());
        addNotification({type: 'success', message: 'Demo data has been reset.'})
    }
    
    return {
        // User & Auth
        currentUser,
        role,
        subscription,
        handleUserChange,
        
        // App State
        ...appState,
        branding,
        setBranding,
        security,
        setSecurity,
        
        // AI Service
        aiLogs,
        handleClearLogs,
        runAiTask,
        clearAiCache,

        // Notifications
        addAppNotification,
        
        // DevOps
        seedDemoData,
        
        // Setters for modules (simplified for demo)
        setInventory: (inv: InventoryItem[]) => setAppState(s => ({...s, inventory: inv})),
    };
};