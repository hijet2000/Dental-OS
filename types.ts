import { Schema } from "@google/genai";
import React from "react";

// --- Base & Utility Types ---
export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// --- AI & Logging Types ---

export enum AITaskType {
    SUMMARIZE_MEETING_NOTES = 'SUMMARIZE_MEETING_NOTES',
    GENERATE_PATIENT_EMAIL = 'GENERATE_PATIENT_EMAIL',
    ANALYZE_SENTIMENT = 'ANALYZE_SENTIMENT',
    ANALYZE_DENTAL_XRAY = 'ANALYZE_DENTAL_XRAY',
    DAILY_BRIEFING = 'DAILY_BRIEFING',
    NOSHOW_PREDICTION = 'NOSHOW_PREDICTION',
    INVENTORY_REORDER = 'INVENTORY_REORDER',
    SCHEDULE_OPTIMIZATION = 'SCHEDULE_OPTIMIZATION',
    COMPLIANCE_REPORT_GEN = 'COMPLIANCE_REPORT_GEN',
    COMPLIANCE_TASK_SUGGEST = 'COMPLIANCE_TASK_SUGGEST',
    COMPLAINT_TRIAGE = 'COMPLAINT_TRIAGE',
    COMPLAINT_THEME_ANALYSIS = 'COMPLAINT_THEME_ANALYSIS',
    LAB_CHASE_EMAIL = 'LAB_CHASE_EMAIL',
}


export interface AITask {
    name: string;
    description: string;
    prompt: (payload: any) => string;
    responseSchema: Schema;
    requiresImage?: boolean;
}

export type AILogStatus = 'Success' | 'Error' | 'Cached' | 'RateLimited';

export interface AILogEntry {
    id: string;
    timestamp: Date;
    taskType: AITaskType;
    status: AILogStatus;
    latencyMs: number;
    cost: number;
    inputPayload: any;
    outputData?: any;
    error?: string;
}

// --- User, Roles & Permissions ---

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    DENTIST = 'DENTIST',
    HYGIENIST = 'HYGIENIST',
    NURSE = 'NURSE',
    RECEPTION = 'RECEPTION',
    INVENTORY_LEAD = 'INVENTORY_LEAD',
    COMPLIANCE_LEAD = 'COMPLIANCE_LEAD',
    VIEWER = 'VIEWER'
}

export enum PermissionKey {
    VIEW_DASHBOARD = 'VIEW_DASHBOARD',
    VIEW_STAFF_DASHBOARD = 'VIEW_STAFF_DASHBOARD',
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_SUBSCRIPTION = 'MANAGE_SUBSCRIPTION',

    // AI & Integrations
    RUN_AI_TASKS = 'RUN_AI_TASKS',
    VIEW_AI_LOGS = 'VIEW_AI_LOGS',
    CLEAR_AI_LOGS = 'CLEAR_AI_LOGS',

    // Inventory
    VIEW_INVENTORY = 'VIEW_INVENTORY',
    MANAGE_INVENTORY_ITEMS = 'MANAGE_INVENTORY_ITEMS',
    MANAGE_EQUIPMENT = 'MANAGE_EQUIPMENT',
    APPROVE_INVENTORY_ADJUSTMENTS = 'APPROVE_INVENTORY_ADJUSTMENTS',
    RUN_INVENTORY_REPORTS = 'RUN_INVENTORY_REPORTS',

    // Tasks & QR
    VIEW_TASKS = 'VIEW_TASKS',
    COMPLETE_TASKS = 'COMPLETE_TASKS',
    VERIFY_TASKS = 'VERIFY_TASKS',
    MANAGE_TASK_DEFINITIONS = 'MANAGE_TASK_DEFINITIONS',

    // Appointments
    VIEW_APPOINTMENTS = 'VIEW_APPOINTMENTS',
    MANAGE_APPOINTMENTS = 'MANAGE_APPOINTMENTS',
    MANAGE_MESSAGING_TEMPLATES = 'MANAGE_MESSAGING_TEMPLATES',
    VIEW_APPOINTMENT_LOGS = 'VIEW_APPOINTMENT_LOGS',

    // Staff & Kiosk
    VIEW_STAFF_LIST = 'VIEW_STAFF_LIST',
    MANAGE_STAFF = 'MANAGE_STAFF',
    MANAGE_ROTA = 'MANAGE_ROTA',
    APPROVE_TIMEOFF = 'APPROVE_TIMEOFF',
    EXPORT_PAYROLL = 'EXPORT_PAYROLL',
    USE_KIOSK = 'USE_KIOSK',

    // Compliance
    VIEW_COMPLIANCE_TASKS = 'VIEW_COMPLIANCE_TASKS',
    COMPLETE_COMPLIANCE_TASKS = 'COMPLETE_COMPLIANCE_TASKS',
    MANAGE_COMPLIANCE_LIBRARY = 'MANAGE_COMPLIANCE_LIBRARY',
    EXPORT_COMPLIANCE_REPORTS = 'EXPORT_COMPLIANCE_REPORTS',

    // Labs & Complaints
    VIEW_LAB_CASES = 'VIEW_LAB_CASES',
    MANAGE_LAB_CASES = 'MANAGE_LAB_CASES',
    VIEW_COMPLAINTS = 'VIEW_COMPLAINTS',
    MANAGE_COMPLAINTS = 'MANAGE_COMPLAINTS',
    
    // Files & Data
    MANAGE_FILES = 'MANAGE_FILES',
    MANAGE_BACKUPS = 'MANAGE_BACKUPS',
    IMPORT_EXPORT_DATA = 'IMPORT_EXPORT_DATA',
    
    // Branding & Security
    MANAGE_BRANDING = 'MANAGE_BRANDING',
    MANAGE_SECURITY = 'MANAGE_SECURITY',

    // QA & DevOps
    MANAGE_QA_DEVOPS = 'MANAGE_QA_DEVOPS',
    
    // Notifications
    MANAGE_NOTIFICATIONS = 'MANAGE_NOTIFICATIONS',
}


// --- Subscription & Usage Types ---

export enum SubscriptionPlan {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

export type AddonKey = 'ai_pack_1' | 'ai_pack_5' | 'extra_storage_10gb' | 'extra_sms_100';

export interface Usage {
    aiCalls: number;
    smsSent: number;
    storageGb: number;
}

export interface Subscription {
    user: string;
    plan: SubscriptionPlan;
    usage: Usage;
    purchasedAddons: Partial<Record<AddonKey, number>>;
}

// --- Module-specific types ---

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    reorderPoint: number;
    targetStock: number;
    supplierId: string;
    qrCode: string;
    usageLog: { date: string; quantity: number }[];
}

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    purchaseDate: string;
    warrantyExpiry: string;
    serviceIntervalMonths: number;
    lastServiceDate: string;
    qrCode: string;
}

export interface TaskRun {
    id: string;
    defId: string;
    qrAreaId: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'verified' | 'overdue';
    completedBy?: string;
    completedAt?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationScore?: number;
}

export interface Patient {
    id: string;
    name: string;
    noShowHistory: number;
    totalAppointments: number;
}

export interface Appointment {
    id: string;
    patientId: string;
    time: string;
    type: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    noShowRisk?: 'Low' | 'Medium' | 'High';
}

export interface StaffMember {
    id: string;
    name: string;
    role: UserRole;
    pin: string;
    qrBadge: string;
}

export interface TimeOffRequest {
    id: string;
    staffId: string;
    startDate: string;

    endDate: string;
    status: 'pending' | 'approved' | 'denied';
}
export interface RotaShift {
    id: string;
    staffId: string;
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    startTime: string;
    endTime: string;
}
export interface ClockInEvent {
    id: string;
    staffId: string;
    timestamp: string;
    type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
}
export interface ComplianceTaskRun {
    id: string;
    defId: string;
    dueDate: string;
    status: 'compliant' | 'due_soon' | 'overdue';
    completedAt?: string;
    evidence?: { type: 'photo' | 'file' | 'note'; value: string };
}
export interface LabCase {
    id: string;
    patientName: string;
    labId: string;
    sentDate: string;
    dueDate: string;
    status: 'sent' | 'in_progress' | 'completed' | 'overdue';
}
export interface Complaint {
    id: string;
    patientName: string;
    date: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'open' | 'resolved';
}

export interface BrandingSettings {
    logoUrl: string | null;
    faviconUrl: string | null;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
    };
    theme: 'light' | 'dark';
    pdfHeader: string;
    pdfFooter: string;
    qrSheetStyle: 'standard' | 'branded';
}

export interface SecuritySettings {
    mfaEnabled: boolean;
    sessionTimeoutMinutes: number;
    passwordStrength: 'medium' | 'strong';
    ipAllowlist: string[];
}

export interface StoredFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
}

export interface BackupRecord {
    id: string;
    timestamp: string;
    size: number;
    status: 'completed' | 'in_progress' | 'failed';
}

export enum NotificationTrigger {
    LOW_STOCK = 'LOW_STOCK',
    OVERDUE_COMPLIANCE = 'OVERDUE_COMPLIANCE',
    TASK_MISSED = 'TASK_MISSED',
    HIGH_NOSHOW_RISK = 'HIGH_NOSHOW_RISK',
    KIOSK_ANOMALY = 'KIOSK_ANOMALY',
    PAYMENT_ISSUE = 'PAYMENT_ISSUE',
}

export enum NotificationChannel {
    IN_APP = 'IN_APP',
    EMAIL = 'EMAIL',
    SMS = 'SMS',
}

export interface Notification {
    id: string;
    trigger: NotificationTrigger;
    message: string;
    timestamp: Date;
    read: boolean;
}

export type FeatureFlagId = 'newDashboardBeta';
