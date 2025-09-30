import { CourseOfTreatment } from '../types';

/**
 * A placeholder service to simulate interactions with the NHS EDI (Electronic Data Interchange)
 * for submitting FP17 claims.
 */
export const nhsEdiService = {
    /**
     * Simulates submitting an FP17 claim for a completed course of treatment.
     * @param course The course of treatment to submit.
     * @param udas The total UDAs calculated for the course.
     * @param patientCharge The patient charge calculated.
     * @returns A promise that resolves with the submission result.
     */
    submitFp17Claim: (
        course: CourseOfTreatment,
        udas: number,
        patientCharge: number
    ): Promise<{ success: boolean; trackingNumber: string; message: string }> => {
        console.log(`[nhsEdiService] Submitting FP17 for CoT ${course.id}...`);
        console.log(`  - Patient ID: ${course.patientId}`);
        console.log(`  - Total UDAs: ${udas}`);
        console.log(`  - Patient Charge: £${patientCharge.toFixed(2)}`);

        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                const success = true;
                const trackingNumber = `NHS-BSA-${Date.now()}`;
                const message = `FP17 claim for CoT ${course.id} submitted successfully.`;
                console.log(`[nhsEdiService] ${message} (Tracking #: ${trackingNumber})`);
                resolve({ success, trackingNumber, message });
            }, 1500);
        });
    },
};