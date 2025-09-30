import { v4 as uuidv4 } from 'uuid';
import { MOCK_NHS_PROCEDURE_CODES, MOCK_COURSES_OF_TREATMENT, MOCK_FP17_CLAIMS } from '../constants';
import { CourseOfTreatment, NhsProcedure, FP17Claim, Patient } from '../types';
import { nhsEdiService } from './nhsEdiService';

// In-memory store for demonstration
let coursesOfTreatment: CourseOfTreatment[] = JSON.parse(JSON.stringify(MOCK_COURSES_OF_TREATMENT));
let claims: FP17Claim[] = JSON.parse(JSON.stringify(MOCK_FP17_CLAIMS));
const procedureCodes: NhsProcedure[] = JSON.parse(JSON.stringify(MOCK_NHS_PROCEDURE_CODES));

// NHS Patient Charges for England (as of a certain date, for example)
const NHS_CHARGES = {
    'Urgent': 26.80,
    1: 26.80,
    2: 73.50,
    3: 319.10,
};

export const nhsService = {
    // --- Procedure Codes ---
    getNhsProcedureCodes: (): NhsProcedure[] => [...procedureCodes],

    // --- Courses of Treatment (CoT) ---
    getCoursesForPatient: (patientId: string): CourseOfTreatment[] => {
        return coursesOfTreatment
            .filter(cot => cot.patientId === patientId)
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    },

    getActiveCourseForPatient: (patientId: string): CourseOfTreatment | undefined => {
        return coursesOfTreatment.find(cot => cot.patientId === patientId && cot.status === 'active');
    },

    startCourseOfTreatment: (patientId: string): CourseOfTreatment => {
        if (nhsService.getActiveCourseForPatient(patientId)) {
            throw new Error("Patient already has an active course of treatment.");
        }
        const newCoT: CourseOfTreatment = {
            id: `cot-${uuidv4()}`,
            patientId,
            startDate: new Date(),
            status: 'active',
            procedures: [],
        };
        coursesOfTreatment.unshift(newCoT);
        return newCoT;
    },

    addProcedureToCourse: (courseId: string, procedureCode: string): CourseOfTreatment => {
        const courseIndex = coursesOfTreatment.findIndex(c => c.id === courseId);
        if (courseIndex === -1) throw new Error("Course of treatment not found.");
        
        const course = coursesOfTreatment[courseIndex];
        if (course.status === 'completed') throw new Error("Cannot add procedures to a completed course of treatment.");

        const procedure = procedureCodes.find(p => p.code === procedureCode);
        if (!procedure) throw new Error("NHS procedure code not found.");

        course.procedures.push(procedure);
        coursesOfTreatment[courseIndex] = course;
        return course;
    },
    
    // --- Calculation Logic ---
    calculateCourseDetails: (course: CourseOfTreatment, patient: Patient): { udas: number, band: number | 'Urgent', patientCharge: number } => {
        if (patient.nhsStatus !== 'Paying') {
            return { udas: 0, band: 1, patientCharge: 0 }; // Default for exempt
        }

        if (course.procedures.length === 0) {
            return { udas: 0, band: 1, patientCharge: 0 };
        }

        const totalUdas = course.procedures.reduce((sum, p) => sum + p.udas, 0);
        
        const highestBand = course.procedures.reduce((maxBand, p) => {
            if (p.band === 'Urgent') return 'Urgent';
            if (maxBand === 'Urgent') return 'Urgent';
            return Math.max(maxBand, p.band);
        }, 1 as number | 'Urgent');

        const patientCharge = NHS_CHARGES[highestBand];

        return { udas: totalUdas, band: highestBand, patientCharge };
    },
    
    // --- Claim Submission ---
    submitFp17: async (courseId: string, patient: Patient): Promise<FP17Claim> => {
        const courseIndex = coursesOfTreatment.findIndex(c => c.id === courseId);
        if (courseIndex === -1) throw new Error("Course of treatment not found.");

        const course = coursesOfTreatment[courseIndex];
        if (course.status === 'completed') throw new Error("Course has already been submitted.");

        const { udas, patientCharge } = nhsService.calculateCourseDetails(course, patient);
        
        const result = await nhsEdiService.submitFp17Claim(course, udas, patientCharge);
        if(!result.success) throw new Error("FP17 submission failed via EDI service.");

        const newClaim: FP17Claim = {
            id: `fp17-${uuidv4()}`,
            courseOfTreatmentId: courseId,
            submissionDate: new Date(),
            totalUdas: udas,
            patientCharge: patientCharge,
            status: 'submitted',
            trackingNumber: result.trackingNumber,
        };
        claims.unshift(newClaim);

        // Mark course as completed
        course.endDate = new Date();
        course.status = 'completed';
        course.fp17ClaimId = newClaim.id;
        coursesOfTreatment[courseIndex] = course;
        
        return newClaim;
    },
};