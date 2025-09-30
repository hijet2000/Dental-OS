
import { MOCK_APPOINTMENTS } from '../constants';
import { Appointment } from '../types';

let appointments: Appointment[] = JSON.parse(JSON.stringify(MOCK_APPOINTMENTS)).map((a: any) => ({
    ...a,
    startTime: new Date(a.startTime),
    endTime: new Date(a.endTime),
}));

export const appointmentService = {
    getAppointmentsInRange: (startDate: Date, endDate: Date): Appointment[] => {
        return appointments.filter(a => a.startTime >= startDate && a.startTime <= endDate);
    },
    getAppointmentsForDate: (date: Date): Appointment[] => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return appointments.filter(a => a.startTime >= startOfDay && a.startTime <= endOfDay);
    },
    getAppointmentsForPatient: (patientId: string): Appointment[] => {
        return appointments.filter(a => a.patientId === patientId);
    },
    deleteAppointmentsForPatient: (patientId: string): number => {
        const initialCount = appointments.length;
        appointments = appointments.filter(a => a.patientId !== patientId);
        return initialCount - appointments.length;
    }
};
