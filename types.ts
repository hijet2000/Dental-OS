

// This file defines all the shared data structures and types used across the application.

// --- User & Access Control ---

export type UserRole = 'Admin' | 'Manager' | 'Dentist' | 'Hygienist' | 'Receptionist' | 'ComplianceLead' | 'PracticeManager';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
    pin: string;
    homeLocationId?: string;
    allowedLocationIds?: string[];
}

// --- Billing & Subscription ---

export type SubscriptionPlan = 'Basic' | 'Pro' | 'Enterprise';

export interface PlanFeature {
    name: string;
    included: boolean;
}

// --- AI & Tasks ---

export interface AITask {
    name: string;
    description: string;
    prompt: (payload: any) => string;
    responseSchema: any; // from @google/genai Type
    redact?: (payload: any) => any;
}

// --- Inventory & Equipment ---

export interface StockCategory {
    id: string;
    name: string;
}

export interface StockLocation {
    id: string;
    name: string;
}

export interface StockLevel {
    locationId: string;
    quantity: number;
}

export interface StockItem {
    id: string;
    name: string;
    itemCode: string;
    category: StockCategory;
    unit: string;
    reorderPoint: number;
    photoUrl: string;
    stockLevels: StockLevel[];
}

export interface EquipmentItem {
    id: string;
    name: string;
    serialNumber: string;
    locationId: string;
    purchaseDate: Date;
    warrantyExpires: Date;
    lastServiceDate: Date;
    serviceIntervalMonths: number;
    photoUrl: string;
}

export interface UsageLog {
    id: string;
    itemId: string;
    quantityUsed: number;
    usedBy: string;
    date: Date;
}

// --- Compliance & Quality ---

export interface Evidence {
    id: string;
    type: 'photo' | 'file' | 'note';
    content: string; // Base64 for files/photos, text for notes
    fileName?: string;
    uploadedBy: string;
    timestamp: Date;
}

export interface ComplianceDocument {
    id: string;
    name: string;
    category: string;
    responsibleRoleId: UserRole;
    reviewCycleDays: number;
    lastReviewed: Date;
    evidence: Evidence[];
    status: 'Compliant' | 'Due Soon' | 'Overdue';
}

export interface Lab {
    id: string;
    name: string;
    contactEmail: string;
}

export interface LabCase {
    id: string;
    patientName: string;
    labId: string;
    caseType: string;
    sentDate: Date;
    dueDate: Date;
    status: 'sent' | 'received' | 'overdue';
}

export interface Complaint {
    id: string;
    patientName: string;
    date: Date;
    description: string;
    category: 'Clinical' | 'Billing' | 'Staff Attitude';
    severity: 'Low' | 'Medium' | 'High';
    status: 'open' | 'resolved';
}

// --- Tenant & Branding ---

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

// --- Security & Data Management ---

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

// --- Patients & Clinical ---

export type NhsStatus = 'Paying' | 'Exempt - Under 18' | 'Exempt - Universal Credit' | 'Not Applicable';

export interface Patient {
    id: string;
    name: string;
    dateOfBirth: Date;
    gender: 'Male' | 'Female' | 'Other';
    nhsNumber: string;
    address: string;
    phone: string;
    email: string;
    avatarUrl: string;
    allergies: string[];
    medicalHistory: string[];
    nhsStatus: NhsStatus;
}

export interface ClinicalNote {
    id: string;
    patientId: string;
    authorId: string;
    timestamp: Date;
    title: string;
    content: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    staffId: string;
    startTime: Date;
    endTime: Date;
    type: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
}

// --- Locations & Rota ---

export interface Location {
    id: string;
    name: string;
    address: string;
    timezone: string;
    phone: string;
    colorTag: string;
    openingHours: {
        day: string;
        open: string;
        close: string;
        isOpen: boolean;
    }[];
    closureDates: { date: Date; reason: string }[];
}

export interface Surgery {
    id: string;
    name: string;
    locationId: string;
    type: 'surgery' | 'hygiene';
    isActive: boolean;
}

export interface Break {
    start: Date;
    end: Date;
    isPaid: boolean;
}

export interface Shift {
    id: string;
    staffId: string;
    locationId: string;
    surgeryId?: string;
    start: Date;
    end: Date;
    breaks: Break[];
    isPublished: boolean;
    source: 'manual' | 'generated';
}

export interface TimePunch {
    id: string;
    userId: string;
    type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
    timestamp: Date;
    isOffline: boolean;
}

export interface TimeOff {
    id: string;
    staffId: string;
    startDate: Date;
    endDate: Date;
    type: 'holiday' | 'sick' | 'unpaid';
    status: 'pending' | 'approved' | 'rejected';
}

// --- Patient Billing ---

export interface InvoiceItem {
    procedureCode: string;
    description: string;
    fee: number;
}

export interface PatientInvoice {
    id: string;
    patientId: string;
    date: Date;
    items: InvoiceItem[];
    total: number;
    amountPaid: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface PatientPayment {
    id: string;
    patientId: string;
    invoiceId: string;
    date: Date;
    amount: number;
    method: 'cash' | 'credit_card';
    transactionId?: string;
}

export interface InsuranceClaim {
    id: string;
    invoiceId: string;
    patientId: string;
    submissionDate: Date;
    status: 'submitted' | 'processing' | 'paid' | 'rejected';
    trackingNumber: string;
    amountPaid: number;
}

export interface ProcedureCode {
    code: string;
    description: string;
    fee: number;
}

// --- NHS Management ---

export interface NhsProcedure {
    code: string;
    description: string;
    band: number | 'Urgent';
    udas: number;
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
    status: 'submitted' | 'paid' | 'queried';
    trackingNumber: string;
}

// --- Task Management (QR) ---

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
    frequency: 'daily' | 'weekly' | 'monthly' | 'adhoc';
    performerRoleId: UserRole;
    verifierRoleId: UserRole;
    slaMinutes: number;
}

export interface TaskRun {
    id: string;
    taskDefId: string;
    qrAreaId: string;
    performedBy: string;
    performedAt: Date;
    isSlaBreached: boolean;
    verificationId?: string;
}

export interface Verification {
    id: string;
    taskRunId: string;
    verifiedBy: string;
    verifiedAt: Date;
    status: 'pass' | 'fail';
    comment?: string;
    photoUrl?: string;
}
