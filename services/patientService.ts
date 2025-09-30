
import { MOCK_PATIENTS } from '../constants';
import { Patient } from '../types';
import { v4 as uuidv4 } from 'uuid';

let patients: Patient[] = JSON.parse(JSON.stringify(MOCK_PATIENTS));

const persistPatients = () => {
    // In a real app this would be an API call.
    // Here we're just keeping the in-memory array, but a localStorage implementation could go here.
};

export const patientService = {
    getPatients: (): Patient[] => {
        return [...patients].sort((a, b) => a.name.localeCompare(b.name));
    },

    getPatientById: (id: string): Patient | undefined => {
        return patients.find(p => p.id === id);
    },

    savePatient: (patientData: Omit<Patient, 'id'> & { id?: string }): Patient => {
        if (patientData.id) {
            const index = patients.findIndex(p => p.id === patientData.id);
            if (index !== -1) {
                patients[index] = { ...patients[index], ...patientData, id: patientData.id };
                persistPatients();
                return patients[index];
            }
        }
        const newPatient: Patient = { ...patientData, id: `pat-${uuidv4()}` };
        patients.push(newPatient);
        persistPatients();
        return newPatient;
    },

    deletePatient: (id: string): { success: boolean, message: string } => {
        const initialLength = patients.length;
        patients = patients.filter(p => p.id !== id);
        if (patients.length < initialLength) {
            persistPatients();
            return { success: true, message: `Patient record deleted.` };
        }
        return { success: false, message: 'Patient not found.' };
    },
};