

import { appointmentService } from './appointmentService';
import { patientService } from './patientService';
import { qualityService } from './qualityService';
import { auditLogService } from './auditLogService';
// Fix: Corrected import path
import { User } from '../types';

export const gdprService = {
    /**
     * Exports all data related to a specific patient.
     * @param patientId The ID of the patient to export data for.
     * @returns A JSON string containing all of the patient's data.
     */
    // FIX: Make function async to handle awaited calls
    exportPatientData: async (patientId: string): Promise<string> => {
        const patient = patientService.getPatientById(patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }
        const appointments = appointmentService.getAppointmentsForPatient(patientId);
        // FIX: Await the async call to getPatientRecords
        const { labCases, complaints } = await qualityService.getPatientRecords(patient.name);

        const exportData = {
            patientDetails: patient,
            appointments,
            labCases,
            complaints
        };
        
        return JSON.stringify(exportData, null, 2);
    },

    /**
     * Erases all data related to a specific patient.
     * This involves deleting records where possible and anonymizing PHI in others.
     * @param patientId The ID of the patient to erase.
     * @param currentUser The user performing the action, for auditing.
     * @returns A summary message of the actions taken.
     */
    // FIX: Make function async to handle awaited calls
    erasePatientData: async (patientId: string, currentUser: { name: string, role: any }): Promise<string> => {
        const patientData = patientService.getPatientById(patientId);
        if (!patientData) {
            throw new Error("Patient not found");
        }
        
        // 1. Delete direct patient record
        const { success, message } = patientService.deletePatient(patientId);
        if(!success) {
            throw new Error(message);
        }

        // 2. Delete associated appointments
        const deletedAppointmentsCount = appointmentService.deleteAppointmentsForPatient(patientId);
        
        // 3. Anonymize records in other services
        // FIX: Await the async call to anonymizePatientRecords
        const anonymizedCount = await qualityService.anonymizePatientRecords(patientData.name);

        const summary = `${message} Deleted ${deletedAppointmentsCount} appointments. Anonymized ${anonymizedCount} related quality records.`;

        auditLogService.log(currentUser.name, currentUser.role, 'Patient data erased (GDPR)', {
            erasedPatientId: patientId,
            erasedPatientName: patientData.name, // Log name here as it will be gone from the system
            summary,
        });

        return summary;
    }
};
