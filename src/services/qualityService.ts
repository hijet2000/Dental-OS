
import { MOCK_LABS, MOCK_LAB_CASES, MOCK_COMPLAINTS } from '../constants';
import { Lab, LabCase, Complaint } from '../types';
import { v4 as uuidv4 } from 'uuid';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for demonstration
let labs: Lab[] = JSON.parse(JSON.stringify(MOCK_LABS));
let labCases: LabCase[] = JSON.parse(JSON.stringify(MOCK_LAB_CASES)).map((c: any, index: number) => ({ ...c, id: `case-${index + 1}`, sentDate: new Date(c.sentDate), dueDate: new Date(c.dueDate) }));
let complaints: Complaint[] = JSON.parse(JSON.stringify(MOCK_COMPLAINTS)).map((c: any, index: number) => ({ ...c, id: `comp-${index + 1}`, date: new Date(c.date) }));

export const qualityService = {
    // --- Labs ---
    getLabs: async (): Promise<Lab[]> => {
        await simulateDelay(200);
        return [...labs];
    },
    getLabCases: async (): Promise<LabCase[]> => {
        await simulateDelay(300);
        // Dynamically calculate status
        const today = new Date();
        return [...labCases].map(c => ({
            ...c,
            status: c.status !== 'received' && today > c.dueDate ? 'overdue' : c.status
        })).sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime());
    },
    getLabById: async (id: string): Promise<Lab | undefined> => {
        await simulateDelay(50);
        return labs.find(l => l.id === id)
    },
    getLabsDueSoon: async (days: number = 7): Promise<LabCase[]> => {
        const today = new Date();
        const threshold = new Date();
        threshold.setDate(today.getDate() + days);
        const allCases = await qualityService.getLabCases();
        return allCases.filter(c => c.status !== 'received' && c.dueDate <= threshold);
    },

    // --- Complaints ---
    getComplaints: async (): Promise<Complaint[]> => {
        await simulateDelay(250);
        return [...complaints].sort((a,b) => b.date.getTime() - a.date.getTime());
    },
    getOpenComplaints: async (): Promise<Complaint[]> => {
        const allComplaints = await qualityService.getComplaints();
        return allComplaints.filter(c => c.status === 'open');
    },
    addComplaint: async (complaint: Omit<Complaint, 'id'>): Promise<Complaint> => {
        await simulateDelay(400);
        const newComplaint: Complaint = { ...complaint, id: `comp-${uuidv4()}`};
        complaints.unshift(newComplaint);
        return newComplaint;
    },
    updateComplaint: async (id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> => {
        await simulateDelay(200);
        const index = complaints.findIndex(c => c.id === id);
        if (index === -1) return undefined;
        complaints[index] = { ...complaints[index], ...updates };
        return complaints[index];
    },

    // --- Reporting Metrics ---
    getAverageLabTurnaround: async (): Promise<number> => {
        await simulateDelay(100);
        const receivedCases = labCases.filter(c => c.status === 'received');
        if (receivedCases.length === 0) return 0;
        const totalDays = receivedCases.reduce((acc, c) => {
            const turnaround = (c.dueDate.getTime() - c.sentDate.getTime()) / (1000 * 3600 * 24);
            return acc + turnaround;
        }, 0);
        return totalDays / receivedCases.length;
    },
    getAverageComplaintResolutionTime: async (): Promise<number> => {
        await simulateDelay(100);
        const resolved = complaints.filter(c => c.status === 'resolved');
        if (resolved.length === 0) return 0;
         const totalDays = resolved.reduce((acc, c) => {
            const resolutionTime = (new Date().getTime() - c.date.getTime()) / (1000 * 3600 * 24);
            return acc + resolutionTime;
        }, 0);
        return totalDays / resolved.length;
    },
};