import { MOCK_QR_AREAS, MOCK_TASK_DEFS, MOCK_TASK_RUNS, MOCK_VERIFICATIONS } from '../constants';
import { QRArea, TaskDef, TaskRun, Verification } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demonstration purposes
let qrAreas: QRArea[] = JSON.parse(JSON.stringify(MOCK_QR_AREAS));
let taskDefs: TaskDef[] = JSON.parse(JSON.stringify(MOCK_TASK_DEFS));
let taskRuns: TaskRun[] = JSON.parse(JSON.stringify(MOCK_TASK_RUNS)).map((r: any) => ({ ...r, performedAt: new Date(r.performedAt) }));
let verifications: Verification[] = JSON.parse(JSON.stringify(MOCK_VERIFICATIONS)).map((v: any) => ({ ...v, verifiedAt: new Date(v.verifiedAt) }));

export const taskService = {
    // --- QR Area Management ---
    getQRAreas: (): QRArea[] => [...qrAreas],
    getQRAreaById: (id: string): QRArea | undefined => qrAreas.find(a => a.id === id),
    saveQRArea: (area: Omit<QRArea, 'id'> & { id?: string }): QRArea => {
        if (area.id) {
            const index = qrAreas.findIndex(a => a.id === area.id);
            if (index !== -1) {
                qrAreas[index] = { ...qrAreas[index], ...area, id: area.id };
                return qrAreas[index];
            }
        }
        const newArea: QRArea = { ...area, id: uuidv4(), qrCodeContent: area.qrCodeContent || area.name.toLowerCase().replace(/\s/g, '-') };
        qrAreas.push(newArea);
        return newArea;
    },
    deleteQRArea: (id: string): boolean => {
        const initialLength = qrAreas.length;
        qrAreas = qrAreas.filter(a => a.id !== id);
        return qrAreas.length < initialLength;
    },

    // --- Task Definition Management ---
    getTaskDefs: (): TaskDef[] => [...taskDefs],
    getTaskDefById: (id: string): TaskDef | undefined => taskDefs.find(d => d.id === id),
    saveTaskDef: (def: Omit<TaskDef, 'id'> & { id?: string }): TaskDef => {
        if (def.id) {
            const index = taskDefs.findIndex(d => d.id === def.id);
            if (index !== -1) {
                taskDefs[index] = { ...taskDefs[index], ...def, id: def.id };
                return taskDefs[index];
            }
        }
        const newDef: TaskDef = { ...def, id: uuidv4() } as TaskDef;
        taskDefs.push(newDef);
        return newDef;
    },
    deleteTaskDef: (id: string): boolean => {
        const initialLength = taskDefs.length;
        taskDefs = taskDefs.filter(d => d.id !== id);
        return taskDefs.length < initialLength;
    },

    // --- Task Run & Verification Management ---
    getTaskRuns: (): TaskRun[] => [...taskRuns].sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime()),
    getVerifications: (): Verification[] => [...verifications],
    getTaskRunById: (id: string): TaskRun | undefined => taskRuns.find(r => r.id === id),
    getVerificationForRun: (taskRunId: string): Verification | undefined => verifications.find(v => v.taskRunId === taskRunId),

    // In a real app, these would be more complex, involving notifications, etc.
    createTaskRun: (runData: Omit<TaskRun, 'id' | 'isSlaBreached'>): TaskRun => {
        const taskDef = taskDefs.find(d => d.id === runData.taskDefId);
        if (!taskDef) throw new Error('Task Definition not found');
        
        const slaDeadline = new Date(runData.performedAt.getTime() - taskDef.slaMinutes * 60 * 1000);
        const taskDefCreationTime = new Date(); // This is a simplification. We'd need to know when the task *should* have been done.
        
        const newRun: TaskRun = {
            ...runData,
            id: uuidv4(),
            isSlaBreached: false, // Simplification for now
        };
        taskRuns.unshift(newRun);
        return newRun;
    },

    createVerification: (verificationData: Omit<Verification, 'id'>): Verification => {
        const newVerification: Verification = {
            ...verificationData,
            id: uuidv4(),
        };
        verifications.unshift(newVerification);
        
        // Link it to the task run
        const runIndex = taskRuns.findIndex(r => r.id === verificationData.taskRunId);
        if (runIndex !== -1) {
            taskRuns[runIndex].verificationId = newVerification.id;
        }

        return newVerification;
    },
};
