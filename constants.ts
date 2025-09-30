
import {
    User, StockItem, EquipmentItem, ComplianceDocument, Appointment, Patient, ClinicalNote, Lab,
    LabCase, Complaint, NhsProcedure, CourseOfTreatment, FP17Claim, QRArea, TaskDef,
    TaskRun, Verification, Shift, TimeOff, Location, Surgery
} from './types';

export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Dr. Evelyn Reed', email: 'e.reed@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=user-1', pin: '1234' },
    { id: 'user-2', name: 'Charles Green', email: 'c.green@example.com', role: 'Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', pin: '5678' },
    { id: 'user-3', name: 'Dr. Alice Johnson', email: 'a.johnson@example.com', role: 'Dentist', avatarUrl: 'https://i.pravatar.cc/150?u=user-3', pin: '1122' },
    { id: 'user-4', name: 'Brian Hall', email: 'b.hall@example.com', role: 'Hygienist', avatarUrl: 'https://i.pravatar.cc/150?u=user-4', pin: '3344' },
    { id: 'user-5', name: 'Diana Prince', email: 'd.prince@example.com', role: 'Receptionist', avatarUrl: 'https://i.pravatar.cc/150?u=user-5', pin: '5566' },
    { id: 'user-6', name: 'Frank West', email: 'f.west@example.com', role: 'ComplianceLead', avatarUrl: 'https://i.pravatar.cc/150?u=user-6', pin: '7788' }
];

export const MOCK_LOCATIONS: Location[] = [
    { id: 'loc-1', name: 'Downtown Dental Center', address: '123 Main St, Anytown', timezone: 'GMT', phone: '555-1234', colorTag: 'bg-blue-500', openingHours: [], closureDates: [] },
    { id: 'loc-2', name: 'Uptown Clinic', address: '456 Oak Ave, Anytown', timezone: 'GMT', phone: '555-5678', colorTag: 'bg-green-500', openingHours: [], closureDates: [] }
];

export const MOCK_SURGERIES: Surgery[] = [
    { id: 'surg-1', name: 'Surgery 1', locationId: 'loc-1', type: 'surgery', isActive: true },
    { id: 'surg-2', name: 'Hygiene Room A', locationId: 'loc-1', type: 'hygiene', isActive: true },
    { id: 'surg-3', name: 'Surgery 2', locationId: 'loc-2', type: 'surgery', isActive: true }
];

export const MOCK_STOCK_ITEMS: Omit<StockItem, 'id'>[] = [
    { name: 'Composite Resin Syringe', itemCode: 'CRS-A2', category: { id: 'cat-1', name: 'Restorative' }, unit: 'syringe', reorderPoint: 10, photoUrl: 'https://placehold.co/100x100', stockLevels: [{ locationId: 'loc-1', quantity: 15 }, { locationId: 'loc-2', quantity: 8 }] },
    { name: 'Latex Gloves (Medium)', itemCode: 'GLV-M', category: { id: 'cat-2', name: 'Consumables' }, unit: 'box', reorderPoint: 5, photoUrl: 'https://placehold.co/100x100', stockLevels: [{ locationId: 'loc-1', quantity: 3 }, { locationId: 'loc-2', quantity: 4 }] },
];

export const MOCK_EQUIPMENT: Omit<EquipmentItem, 'id'>[] = [
    { name: 'Autoclave Unit 1', locationId: 'loc-1', purchaseDate: new Date('2022-01-15'), warrantyExpires: new Date('2025-01-14'), lastServiceDate: new Date('2023-11-20'), serviceIntervalMonths: 6 },
    { name: 'X-Ray Machine', locationId: 'loc-2', purchaseDate: new Date('2021-06-01'), warrantyExpires: new Date('2024-05-31'), lastServiceDate: new Date('2023-06-10'), serviceIntervalMonths: 12 },
];

export const MOCK_COMPLIANCE_DOCS: Omit<ComplianceDocument, 'id' | 'status'>[] = [
    { name: 'Fire Safety Policy', category: 'Health & Safety', reviewCycleDays: 365, lastReviewed: new Date('2023-05-10') },
    { name: 'Infection Control Protocol', category: 'Clinical Governance', reviewCycleDays: 180, lastReviewed: new Date('2023-12-01') },
    { name: 'Data Protection Policy (GDPR)', category: 'Information Governance', reviewCycleDays: 365, lastReviewed: new Date('2024-01-20') },
];

export const MOCK_APPOINTMENTS: Omit<Appointment, 'id'>[] = [
    { patientId: 'pat-1', staffId: 'user-3', startTime: new Date(new Date().setHours(9, 0, 0, 0)), endTime: new Date(new Date().setHours(9, 45, 0, 0)), type: 'Check-up', status: 'confirmed' },
    { patientId: 'pat-2', staffId: 'user-4', startTime: new Date(new Date().setHours(10, 0, 0, 0)), endTime: new Date(new Date().setHours(10, 30, 0, 0)), type: 'Hygiene', status: 'confirmed' },
];

export const MOCK_PATIENTS: Patient[] = [
    { id: 'pat-1', name: 'John Smith', dateOfBirth: new Date('1985-02-20'), gender: 'Male', address: '1 Apple Rd', phone: '555-0011', email: 'j.smith@email.com', nhsNumber: '1234567890', nhsStatus: 'Paying', avatarUrl: 'https://i.pravatar.cc/150?u=pat-1' },
    { id: 'pat-2', name: 'Maria Garcia', dateOfBirth: new Date('1992-07-15'), gender: 'Female', address: '2 Orange St', phone: '555-0022', email: 'm.garcia@email.com', nhsNumber: '0987654321', nhsStatus: 'Exempt', avatarUrl: 'https://i.pravatar.cc/150?u=pat-2' },
];

export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [
  { id: 'note-1', patientId: 'pat-1', authorId: 'user-3', timestamp: new Date(), title: 'Initial Consultation', content: 'Patient presented with mild sensitivity in ULQ. No signs of decay. Recommended sensitive toothpaste.' },
  { id: 'note-2', patientId: 'pat-1', authorId: 'user-4', timestamp: new Date(Date.now() - 86400000 * 2), title: 'Scale & Polish', content: 'Routine hygiene appointment. Moderate plaque buildup. Oral hygiene advice given.' },
  { id: 'note-3', patientId: 'pat-2', authorId: 'user-3', timestamp: new Date(Date.now() - 86400000 * 5), title: 'Wisdom Tooth Extraction', content: 'UR8 extracted under local anesthetic. No complications.' },
];

export const MOCK_LABS: Lab[] = [
    { id: 'lab-1', name: 'Precision Dental Labs', contactPerson: 'Sarah Jones', phone: '555-LABS', email: 'info@precisionlabs.test' },
];

export const MOCK_LAB_CASES: Omit<LabCase, 'id'>[] = [
    { patientName: 'John Smith', caseType: 'Crown', labId: 'lab-1', sentDate: new Date(Date.now() - 86400000 * 10), dueDate: new Date(Date.now() + 86400000 * 4), status: 'sent' },
    { patientName: 'Maria Garcia', caseType: 'Denture Repair', labId: 'lab-1', sentDate: new Date(Date.now() - 86400000 * 5), dueDate: new Date(Date.now() - 86400000 * 1), status: 'sent' }, // This one will be overdue
];

export const MOCK_COMPLAINTS: Omit<Complaint, 'id'>[] = [
    { patientName: 'Anonymous', date: new Date(Date.now() - 86400000 * 3), description: 'The waiting room was too cold.', category: 'Other', severity: 'Low', status: 'open' },
];

export const MOCK_NHS_PROCEDURE_CODES: NhsProcedure[] = [
    { code: 'EXAM', description: 'Examination', udas: 1.25, band: 1 },
    { code: 'XRAY', description: 'Radiograph', udas: 0.5, band: 1 },
    { code: 'FILL1', description: 'Amalgam Filling (1 surface)', udas: 3, band: 2 },
    { code: 'CROWN1', description: 'Crown', udas: 12, band: 3 },
];

export const MOCK_COURSES_OF_TREATMENT: CourseOfTreatment[] = [];
export const MOCK_FP17_CLAIMS: FP17Claim[] = [];

export const MOCK_QR_AREAS: QRArea[] = [
    { id: 'qr-1', name: 'Surgery 1 Clean', locationDescription: 'Inside Surgery 1, by the door', qrCodeContent: 'surg1-clean-task' },
];

export const MOCK_TASK_DEFS: TaskDef[] = [
    { id: 'taskdef-1', title: 'Morning Surgery Prep', description: 'Clean and prepare surgery for the day.', frequency: 'daily', performerRoleId: 'Receptionist', verifierRoleId: 'Manager', slaMinutes: 15, pointsValue: 10 },
];

export const MOCK_TASK_RUNS: TaskRun[] = [];
export const MOCK_VERIFICATIONS: Verification[] = [];

export const MOCK_SHIFTS: Shift[] = [];
export const MOCK_TIMEOFF: TimeOff[] = [];