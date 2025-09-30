
import { Type } from '@google/genai';

export type UserRole = 'Admin' | 'Manager' | 'Dentist' | 'Hygienist' | 'Receptionist' | 'ComplianceLead';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
    pin: string;
}

export type SubscriptionPlan = 'Basic' | 'Pro' | 'Enterprise';

export interface PlanFeature {
    name: string;
    included: boolean;
}

export interface TenantBranding {
    tenantName: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    defaultTheme: 'light' | 'dark';
    pdfHeader: string;
    pdfFooter: string;
}

export interface JSONSchema {
  type: Type;
  description?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  propertyOrdering?: string[];
}

export interface AITask<Payload = Record<string, unknown>, RedactedPayload = Payload> {
    name: string;
    description: string;
    prompt: (payload: RedactedPayload) => string;
    responseSchema: JSONSchema;
    redact?: (payload: Payload) => RedactedPayload;
}

export interface ComplianceDocument {
    id: string;
    name: string;
    category: string;
    reviewCycleDays: number;
    lastReviewed: Date;
    status: 'Compliant' | 'Due Soon' | 'Overdue';
}

export interface StockItem {
    id: string;
    name: string;
    itemCode: string;
    category: { id: string; name: string };
    unit: string;
    reorderPoint: number;
    photoUrl: string;
    stockLevels: { locationId: string; quantity: number }[];
}

export interface EquipmentItem {
    id: string;
    name: string;
    locationId: string;
    purchaseDate: Date;
    warrantyExpires: Date;
    lastServiceDate: Date;
    serviceIntervalMonths: number;
}

export interface OpeningHour {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    open: string;
    close: string;
    isOpen: boolean;
}

export interface Location {
    id: string;
    name: string;
    address: string;
    timezone: string;
    phone: string;
    colorTag: string;
    openingHours: OpeningHour[];
    closureDates: Date[];
}

export interface Surgery {
    id: string;
    name: string;
    locationId: string;
    type: 'surgery' | 'hygiene' | 'consult';
    isActive: boolean;
}

export interface TimePunch {
    id: string;
    userId: string;
    type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
    timestamp: Date;
    isOffline: boolean;
}

export interface UserStatus {
    status: 'On Shift' | 'On Break' | 'Clocked Out';
    lastPunch?: TimePunch;
}

export interface LiveUserStatus {
    user: User;
    status: UserStatus;
}

export interface Lab {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
}

export interface LabCase {
    id: string;
    patientName: string;
    caseType: string;
    labId: string;
    sentDate: Date;
    dueDate: Date;
    status: 'sent' | 'received' | 'overdue';
}

export interface Complaint {
    id: string;
    patientName: string;
    date: Date;
    description: string;
    category: 'Clinical' | 'Billing' | 'Staff Attitude' | 'Other';
    severity: 'Low' | 'Medium' | 'High';
    status: 'open' | 'resolved' | 'escalated';
}

export interface SecurityPolicies {
    enforceStrongPasswords: boolean;
    mfaEnabled: boolean;
    sessionTimeoutMinutes: number;
    ipAllowlist: string[];
}

export interface Backup {
    id: string;
    timestamp: Date;
    fileName: string;
    sizeBytes: number;
}

export interface QRArea {
    id: string;
    name: string;
    locationDescription: string;
    qrCodeContent: string;
}

export interface TaskDef {
    id: string;
    title: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'ad-hoc';
    performerRoleId: UserRole;
    verifierRoleId: UserRole;
    slaMinutes: number;
    pointsValue: number;
}

export interface TaskRun {
    id: string;
    taskDefId: string;
    performerId: string;
    performedAt: Date;
    qrAreaId: string;
    verificationId?: string;
    isSlaBreached: boolean;
}

export interface Verification {
    id: string;
    taskRunId: string;
    verifierId: string;
    verifiedAt: Date;
    score: number; // e.g., 1-5
    comments?: string;
}

export interface Shift {
    id: string;
    staffId: string;
    locationId: string;
    start: Date;
    end: Date;
    role: UserRole;
    isPublished: boolean;
}

export interface TimeOff {
    id: string;
    staffId: string;
    startDate: Date;
    endDate: Date;
    type: 'holiday' | 'sick' | 'unpaid';
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
}

// Payloads for AI Tasks
export interface DailyBriefPayload {
    onDuty: LiveUserStatus[];
    lowStock: StockItem[];
    overdueCompliance: ComplianceDocument[];
    labsDue: LabCase[];
    openComplaints: Complaint[];
}

export interface InventoryReorderPayload {
    itemName: string;
    usageHistory: { date: string; quantityUsed: number }[];
}

export interface LabChaseEmailPayload {
    labName: string;
    caseType: string;
    daysOverdue: number;
}

export interface ComplaintTriagePayload {
    description: string;
}

export interface SuggestRolePayload {
    userName: string;
    currentRole: UserRole;
    availableRoles: UserRole[];
}

export interface AppAssistantPayload {
    userName: string;
    userRole: UserRole;
    userPermissions: string[];
    currentPage: string;
    lowStockCount: number;
    overdueComplianceCount: number;
    question: string;
}