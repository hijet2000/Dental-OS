// Fix: Corrected import path
import { MOCK_PATIENTS } from '../constants';
// Fix: Corrected import path
import { Patient, NhsStatus } from '../types';

// In-memory store for demonstration
let patients: Patient[] = JSON.parse(JSON.stringify(MOCK_PATIENTS)).map((p: Patient) => ({...p, dateOfBirth: new Date(p.dateOfBirth)}));

export const patientService = {
    // --- Data Retrieval ---
    getPatients: (): Patient[] => {
        return [...patients];
    },
    
    getPatientById: (id: string): Patient | undefined => {
        return patients.find(p => p.id === id);
    },

    // --- Data Mutation ---
    updatePatient: (patientId: string, updates: Partial<Patient>): Patient | undefined => {
        const index = patients.findIndex(p => p.id === patientId);
        if (index === -1) return undefined;
        patients[index] = { ...patients[index], ...updates };
        return patients[index];
    },
    
    updatePatientNhsStatus: (patientId: string, nhsStatus: NhsStatus): Patient | undefined => {
        const index = patients.findIndex(p => p.id === patientId);
        if (index === -1) return undefined;
        patients[index].nhsStatus = nhsStatus;
        return patients[index];
    },

    // --- GDPR ---
    deletePatient: (patientId: string): { success: boolean, message: string } => {
        const initialCount = patients.length;
        patients = patients.filter(p => p.id !== patientId);
        if (patients.length < initialCount) {
             return { success: true, message: `Deleted patient record.`};
        }
        return { success: false, message: 'Patient not found.' };
    },
};