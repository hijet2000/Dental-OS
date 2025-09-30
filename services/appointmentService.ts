import { MOCK_APPOINTMENTS } from '../constants';
import { Appointment } from '../types';
import { v4 as uuidv4 } from 'uuid';

const APPOINTMENTS_KEY = 'dentalos_appointments';

// Initialize appointments from localStorage or mock data, with date re-hydration
let appointments: Appointment[] = (() => {
    const saved = localStorage.getItem(APPOINTMENTS_KEY);
    const data = saved ? JSON.parse(saved) : MOCK_APPOINTMENTS.map((a: any, index: number) => ({ ...a, id: `appt-${index + 1}` }));
    const hydratedData = data.map((a: any) => ({
        ...a,
        startTime: new Date(a.startTime),
        endTime: new Date(a.endTime),
    }));
     if (!saved) {
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(hydratedData));
    }
    return hydratedData;
})();

const persistAppointments = () => localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));

export const appointmentService = {
    getAppointmentsInRange: (startDate: Date, endDate: Date): Appointment[] => {
        return appointments.filter(a => new Date(a.startTime) >= startDate && new Date(a.startTime) <= endDate);
    },
    getAppointmentsForDate: (date: Date): Appointment[] => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return appointments.filter(a => {
            const apptDate = new Date(a.startTime);
            return apptDate >= startOfDay && apptDate <= endOfDay;
        });
    },
    getAppointmentsForPatient: (patientId: string): Appointment[] => {
        return appointments.filter(a => a.patientId === patientId);
    },
    deleteAppointmentsForPatient: (patientId: string): number => {
        const initialCount = appointments.length;
        appointments = appointments.filter(a => a.patientId !== patientId);
        persistAppointments();
        return initialCount - appointments.length;
    }
};