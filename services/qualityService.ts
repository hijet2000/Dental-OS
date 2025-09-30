
// Fix: Corrected import path
import { MOCK_LABS, MOCK_LAB_CASES, MOCK_COMPLAINTS } from '../constants';
// Fix: Corrected import path
import { Lab, LabCase, Complaint } from '../types';

// In-memory store for demonstration
let labs: Lab[] = JSON.parse(JSON.stringify(MOCK_LABS));
let labCases: LabCase[] = JSON.parse(JSON.stringify(MOCK_LAB_CASES)).map((c: any) => ({ ...c, sentDate: new Date(c.sentDate), dueDate: new Date(c.dueDate) }));
let complaints: Complaint[] = JSON.parse(JSON.stringify(MOCK_COMPLAINTS)).map((c: any) => ({ ...c, date: new Date(c.date) }));

export const qualityService = {
    // --- Labs ---
    getLabs: (): Lab[] => [...labs],
    getLabCases: (): LabCase[] => {
        // Dynamically calculate status
        const today = new Date();
        return [...labCases].map(c => ({
            ...c,
            status: c.status !== 'received' && today > c.dueDate ? 'overdue' : c.status
        })).sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime());
    },
    getLabById: (id: string): Lab | undefined => labs.find(l => l.id === id),
    getLabsDueSoon: (days: number = 7): LabCase[] => {
        const today = new Date();
        const threshold = new Date();
        threshold.setDate(today.getDate() + days);
        return qualityService.getLabCases().filter(c => c.status !== 'received' && c.dueDate <= threshold);
    },

    // --- Complaints ---
    getComplaints: (): Complaint[] => [...complaints].sort((a,b) => b.date.getTime() - a.date.getTime()),
    getOpenComplaints: (): Complaint[] => complaints.filter(c => c.status === 'open'),
    addComplaint: (complaint: Omit<Complaint, 'id'>): Complaint => {
        const newComplaint: Complaint = { ...complaint, id: `comp-${Date.now()}`};
        complaints.unshift(newComplaint);
        return newComplaint;
    },
    updateComplaint: (id: string, updates: Partial<Complaint>): Complaint | undefined => {
        const index = complaints.findIndex(c => c.id === id);
        if (index === -1) return undefined;
        complaints[index] = { ...complaints[index], ...updates };
        return complaints[index];
    },

    // --- Reporting Metrics ---
    getAverageLabTurnaround: (): number => {
        const receivedCases = labCases.filter(c => c.status === 'received');
        if (receivedCases.length === 0) return 0;
        const totalDays = receivedCases.reduce((acc, c) => {
            // This is a simplification; a real app would need a "receivedDate"
            const turnaround = (c.dueDate.getTime() - c.sentDate.getTime()) / (1000 * 3600 * 24);
            return acc + turnaround;
        }, 0);
        return totalDays / receivedCases.length;
    },
    getAverageComplaintResolutionTime: (): number => {
        const resolved = complaints.filter(c => c.status === 'resolved');
        if (resolved.length === 0) return 0;
         const totalDays = resolved.reduce((acc, c) => {
            // This is a simplification; a real app would need a "resolvedDate"
            const resolutionTime = (new Date().getTime() - c.date.getTime()) / (1000 * 3600 * 24);
            return acc + resolutionTime;
        }, 0);
        return totalDays / resolved.length;
    },

    // --- GDPR Functions ---
    anonymizePatientRecords: (patientName: string): number => {
        let anonymizedCount = 0;
        labCases = labCases.map(c => {
            if (c.patientName === patientName) {
                anonymizedCount++;
                return { ...c, patientName: '[REDACTED]' };
            }
            return c;
        });
        complaints = complaints.map(c => {
            if (c.patientName === patientName) {
                anonymizedCount++;
                return { ...c, patientName: '[REDACTED]' };
            }
            return c;
        });
        return anonymizedCount;
    },

    getPatientRecords: (patientName: string): { labCases: LabCase[], complaints: Complaint[] } => {
        const patientLabCases = labCases.filter(c => c.patientName === patientName);
        const patientComplaints = complaints.filter(c => c.patientName === patientName);
        return { labCases: patientLabCases, complaints: patientComplaints };
    }
};