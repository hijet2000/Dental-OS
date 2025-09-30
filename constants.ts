

import { User, StockItem, EquipmentItem, ComplianceDocument, Appointment, Patient, Lab, LabCase, Complaint, ProcedureCode, PatientInvoice, PatientPayment, InsuranceClaim, NhsProcedure, CourseOfTreatment, FP17Claim, QRArea, TaskDef, TaskRun, Verification, Shift, TimeOff } from './types';

// This file contains mock data to simulate a database for the application.

// --- Users & Staff ---
export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Dr. Evelyn Reed', email: 'e.reed@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=user-1', pin: '1234', homeLocationId: 'loc-1' },
    { id: 'user-2', name: 'Charles Green', email: 'c.green@example.com', role: 'Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', pin: '5678', homeLocationId: 'loc-1' },
    { id: 'user-3', name: 'Dr. Alice Johnson', email: 'a.johnson@example.com', role: 'Dentist', avatarUrl: 'https://i.pravatar.cc/150?u=user-3', pin: '1122', homeLocationId: 'loc-1' },
    { id: 'user-4', name: 'Brian Hall', email: 'b.hall@example.com', role: 'Hygienist', avatarUrl: 'https://i.pravatar.cc/150?u=user-4', pin: '3344', homeLocationId: 'loc-2' },
    { id: 'user-5', name: 'Diana Price', email: 'd.price@example.com', role: 'Receptionist', avatarUrl: 'https://i.pravatar.cc/150?u=user-5', pin: '5566', homeLocationId: 'loc-1' },
    { id: 'user-6', name: 'Clark Kent', email: 'c.kent@example.com', role: 'ComplianceLead', avatarUrl: 'https://i.pravatar.cc/150?u=user-6', pin: '7788', homeLocationId: 'loc-1' },
];

// --- Inventory ---
export const MOCK_STOCK_ITEMS: Omit<StockItem, 'id'>[] = [
    { name: 'Composite Resin Syringe A2', itemCode: 'CRS-A2', category: { id: 'cat-1', name: 'Restorative' }, unit: 'syringe', reorderPoint: 10, photoUrl: 'https://placehold.co/100x100/cacaca/31343C/png?text=CRS-A2', stockLevels: [{ locationId: 'loc-1', quantity: 15 }, { locationId: 'loc-2', quantity: 8 }] },
    { name: 'Disposable Mirrors', itemCode: 'DM-01', category: { id: 'cat-2', name: 'Disposables' }, unit: 'box', reorderPoint: 5, photoUrl: 'https://placehold.co/100x100/cacaca/31343C/png?text=DM-01', stockLevels: [{ locationId: 'loc-1', quantity: 3 }] },
    { name: 'Anesthetic Cartridges', itemCode: 'AC-LIDO', category: { id: 'cat-3', name: 'Anesthetics' }, unit: 'box', reorderPoint: 20, photoUrl: 'https://placehold.co/100x100/cacaca/31343C/png?text=AC-LIDO', stockLevels: [{ locationId: 'loc-1', quantity: 25 }] },
];

export const MOCK_EQUIPMENT: Omit<EquipmentItem, 'id'>[] = [
    { name: 'Autoclave Sterilizer', serialNumber: 'AUTO-123', locationId: 'loc-1', purchaseDate: new Date('2022-01-15'), warrantyExpires: new Date('2025-01-15'), lastServiceDate: new Date(new Date().setMonth(new Date().getMonth() - 5)), serviceIntervalMonths: 6, photoUrl: 'https://placehold.co/100x100/cacaca/31343C/png?text=AUTO' },
    { name: 'Intraoral X-Ray Unit', serialNumber: 'XRAY-456', locationId: 'loc-2', purchaseDate: new Date('2021-06-20'), warrantyExpires: new Date('2024-06-20'), lastServiceDate: new Date(new Date().setMonth(new Date().getMonth() - 11)), serviceIntervalMonths: 12, photoUrl: 'https://placehold.co/100x100/cacaca/31343C/png?text=XRAY' },
];

// --- Compliance ---
export const MOCK_COMPLIANCE_DOCS: Omit<ComplianceDocument, 'id' | 'status'>[] = [
    { name: 'Fire Safety Policy', category: 'Health & Safety', responsibleRoleId: 'Manager', reviewCycleDays: 365, lastReviewed: new Date(new Date().setMonth(new Date().getMonth() - 11)), evidence: [] },
    { name: 'CQC Inspection Checklist', category: 'Regulatory', responsibleRoleId: 'ComplianceLead', reviewCycleDays: 90, lastReviewed: new Date(new Date().setDate(new Date().getDate() - 100)), evidence: [] },
    { name: 'IRMER Radiation Procedures', category: 'Clinical Governance', responsibleRoleId: 'Dentist', reviewCycleDays: 365, lastReviewed: new Date(new Date().setDate(new Date().getDate() - 20)), evidence: [] },
];

// --- Clinical ---
export const MOCK_APPOINTMENTS: Omit<Appointment, 'id'>[] = [
    { patientId: 'p-1', staffId: 'user-3', startTime: new Date(new Date().setHours(9, 0, 0, 0)), endTime: new Date(new Date().setHours(9, 30, 0, 0)), type: 'Check-up', status: 'confirmed' },
    { patientId: 'p-2', staffId: 'user-4', startTime: new Date(new Date().setHours(10, 0, 0, 0)), endTime: new Date(new Date().setHours(10, 45, 0, 0)), type: 'Hygiene', status: 'scheduled' },
];
export const MOCK_PATIENTS: Omit<Patient, 'id'>[] = [
    { name: 'John Smith', dateOfBirth: new Date('1985-05-20'), gender: 'Male', nhsNumber: '1234567890', address: '1 Test St', phone: '555-001', email: 'j.s@mail.com', avatarUrl: 'https://i.pravatar.cc/150?u=p-1', allergies: ['Penicillin'], medicalHistory: ['Asthma'], nhsStatus: 'Paying' },
    { name: 'Jane Doe', dateOfBirth: new Date('1992-11-10'), gender: 'Female', nhsNumber: '0987654321', address: '2 Example Rd', phone: '555-002', email: 'j.d@mail.com', avatarUrl: 'https://i.pravatar.cc/150?u=p-2', allergies: [], medicalHistory: [], nhsStatus: 'Paying' },
];

export const MOCK_CLINICAL_NOTES: Omit<ClinicalNote, 'id'>[] = [
    { patientId: 'p-1', authorId: 'user-3', timestamp: new Date(), title: 'Initial Consultation', content: 'Patient presented with mild sensitivity on UL7. No caries found on X-ray.' },
];


// --- Quality ---
export const MOCK_LABS: Lab[] = [{ id: 'lab-1', name: 'Precision Dental Lab', contactEmail: 'contact@precisionlab.com' }];
export const MOCK_LAB_CASES: Omit<LabCase, 'id'>[] = [{ patientName: 'John Smith', labId: 'lab-1', caseType: 'Crown', sentDate: new Date(new Date().setDate(new Date().getDate() - 10)), dueDate: new Date(new Date().setDate(new Date().getDate() - 2)), status: 'sent' }];
export const MOCK_COMPLAINTS: Omit<Complaint, 'id'>[] = [{ patientName: 'Jane Doe', date: new Date(new Date().setDate(new Date().getDate() - 5)), description: 'The waiting room was too cold.', category: 'Staff Attitude', severity: 'Low', status: 'open' }];

// --- Billing ---
export const MOCK_PROCEDURE_CODES: ProcedureCode[] = [ { code: 'D0120', description: 'Periodic oral evaluation', fee: 50 }, { code: 'D1110', description: 'Adult prophylaxis', fee: 80 }];
export const MOCK_PATIENT_INVOICES: Omit<PatientInvoice, 'id'>[] = [];
export const MOCK_PATIENT_PAYMENTS: Omit<PatientPayment, 'id'>[] = [];
export const MOCK_INSURANCE_CLAIMS: Omit<InsuranceClaim, 'id'>[] = [];

// --- NHS ---
export const MOCK_NHS_PROCEDURE_CODES: NhsProcedure[] = [{ code: 'FP17', description: 'Examination', band: 1, udas: 1.0 }];
export const MOCK_COURSES_OF_TREATMENT: Omit<CourseOfTreatment, 'id'>[] = [];
export const MOCK_FP17_CLAIMS: Omit<FP17Claim, 'id'>[] = [];

// --- Tasks (QR) ---
export const MOCK_QR_AREAS: Omit<QRArea, 'id'>[] = [{ name: 'Sterilization Room', locationDescription: 'Main autoclave area', qrCodeContent: 'steri-room-main' }];
export const MOCK_TASK_DEFS: Omit<TaskDef, 'id'>[] = [{ title: 'Daily Autoclave Spore Test', description: 'Run and log daily spore test for main autoclave.', frequency: 'daily', performerRoleId: 'Hygienist', verifierRoleId: 'Manager', slaMinutes: 60 }];
export const MOCK_TASK_RUNS: Omit<TaskRun, 'id'>[] = [];
export const MOCK_VERIFICATIONS: Omit<Verification, 'id'>[] = [];

// --- Rota ---
export const MOCK_SHIFTS: Omit<Shift, 'id'>[] = [
    { staffId: 'user-3', locationId: 'loc-1', start: new Date(new Date().setHours(9, 0, 0, 0)), end: new Date(new Date().setHours(17, 0, 0, 0)), breaks: [], isPublished: true, source: 'manual' },
];
export const MOCK_TIMEOFF: Omit<TimeOff, 'id'>[] = [];
