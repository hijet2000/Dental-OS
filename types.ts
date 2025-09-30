
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

export interface Appointment {
    id: string;
    patientId: string;
    staffId: string;
    startTime: Date;
    endTime: Date;
    type: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    notes?: string;
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


export interface Patient {
    id: string;
    name: string;
    dateOfBirth: Date;
    gender: 'Male' | 'Female' | 'Other';
    address: string;
    phone: string;
    email: string;
    nhsNumber: string;
    nhsStatus: 'Paying' | 'Exempt';
    avatarUrl: string;
}

export interface ClinicalNote {
    id: string;
    patientId: string;
    authorId: string;
    author?: User;
    timestamp: Date;
    title: string;
    content: string;
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

export interface PatientInvoice {
    id: string;
    patientId: string;
    date: Date;
    dueDate: Date;
    total: number;
    amountPaid: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
}

export interface PatientPayment {
    id: string;
    patientId: string;
    invoiceId: string;
    date: Date;
    amount: number;
    method: 'credit_card' | 'cash' | 'insurance';
}

export interface InsuranceClaim {
    id: string;
    invoiceId: string;
    submissionDate: Date;
    status: 'submitted' | 'approved' | 'denied';
    trackingNumber: string;
}

export interface NhsProcedure {
    code: string;
    description: string;
    udas: number;
    band: number | 'Urgent';
}

export interface CourseOfTreatment {
    id: string;
    patientId: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed';
    procedures: NhsProcedure[];
    fp17ClaimId?: string;
}

export interface FP17Claim {
    id: string;
    courseOfTreatmentId: string;
    submissionDate: Date;
    totalUdas: number;
    patientCharge: number;
    status: 'submitted' | 'reconciled' | 'rejected';
    trackingNumber: string;
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
    appointments: Appointment[];
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
