import { v4 as uuidv4 } from 'uuid';
import { MOCK_SHIFTS, MOCK_TIMEOFF } from '../constants';
import { Shift, TimeOff, User } from '../types';
import { locationService } from './locationService';
import { notificationRuleEngineService } from './notificationRuleEngineService';

let shifts: Shift[] = JSON.parse(JSON.stringify(MOCK_SHIFTS)).map((s: any) => ({ ...s, start: new Date(s.start), end: new Date(s.end) }));
let timeOff: TimeOff[] = JSON.parse(JSON.stringify(MOCK_TIMEOFF)).map((t: any) => ({ ...t, startDate: new Date(t.startDate), endDate: new Date(t.endDate) }));

export const rotaService = {
    getShiftsForWeek: (startDate: Date): Shift[] => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        return shifts.filter(s => s.start >= startDate && s.start < endDate);
    },

    getTimeOffForUser: (staffId: string): TimeOff[] => {
        return timeOff.filter(t => t.staffId === staffId);
    },

    addShift: (shiftData: Omit<Shift, 'id' | 'isPublished'>): { success: boolean, message: string, shift?: Shift } => {
        // --- CONSTRAINTS ENGINE ---

        // 1. Check for overlapping shifts for the same staff member
        const staffShifts = shifts.filter(s => s.staffId === shiftData.staffId);
        const hasOverlap = staffShifts.some(s =>
            (shiftData.start < s.end && shiftData.end > s.start)
        );
        if (hasOverlap) {
            return { success: false, message: "Staff member is already scheduled at this time." };
        }

        // 2. Check against location opening hours
        if (!locationService.isLocationOpen(shiftData.locationId, shiftData.start) || !locationService.isLocationOpen(shiftData.locationId, new Date(shiftData.end.getTime() - 1))) {
            return { success: false, message: "Shift is outside of the location's opening hours." };
        }

        // 3. Check against approved time off
        const staffTimeOff = timeOff.filter(t => t.staffId === shiftData.staffId && t.status === 'approved');
        const hasTimeOffConflict = staffTimeOff.some(t =>
            (shiftData.start < t.endDate && shiftData.end > t.startDate)
        );
        if (hasTimeOffConflict) {
            return { success: false, message: "Staff member has approved time off during this period." };
        }
        
        // All checks passed, create the shift
        const newShift: Shift = {
            ...shiftData,
            id: `shift-${uuidv4()}`,
            isPublished: false, // New shifts are drafts until published
        };
        shifts.push(newShift);
        return { success: true, message: "Shift added successfully.", shift: newShift };
    },

    updateShift: (shiftId: string, updates: Partial<Shift>): { success: boolean, message: string, shift?: Shift } => {
        const index = shifts.findIndex(s => s.id === shiftId);
        if (index === -1) return { success: false, message: "Shift not found." };
        
        const updatedShift = { ...shifts[index], ...updates };
        
        // Here you would re-run the constraints engine against the updated shift details
        // For brevity, we'll just apply the update.
        shifts[index] = updatedShift;
        return { success: true, message: "Shift updated.", shift: updatedShift };
    },
    
    deleteShift: (shiftId: string): boolean => {
        const initialLength = shifts.length;
        shifts = shifts.filter(s => s.id !== shiftId);
        return shifts.length < initialLength;
    },

    publishRota: (startDate: Date, locationId?: string): number => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        
        let publishedCount = 0;
        const affectedStaff = new Set<string>();

        shifts.forEach(shift => {
            if (shift.start >= startDate && shift.start < endDate && !shift.isPublished) {
                if (!locationId || shift.locationId === locationId) {
                    shift.isPublished = true;
                    publishedCount++;
                    affectedStaff.add(shift.staffId);
                }
            }
        });

        // Trigger notifications for each affected staff member
        affectedStaff.forEach(staffId => {
            notificationRuleEngineService.processEvent('ROTA_PUBLISHED', { userId: staffId });
        });
        
        return publishedCount;
    }
};