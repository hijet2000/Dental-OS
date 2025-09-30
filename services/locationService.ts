
import { Location, Surgery } from '../types';
import { v4 as uuidv4 } from 'uuid';

let locations: Location[] = [
    {
        id: 'loc-1',
        name: 'Downtown Dental',
        address: '123 Main St, Anytown, USA',
        timezone: 'GMT',
        phone: '555-1234',
        colorTag: 'bg-blue-500',
        openingHours: [
            { day: 'Mon', open: '09:00', close: '17:00', isOpen: true },
            { day: 'Tue', open: '09:00', close: '17:00', isOpen: true },
            { day: 'Wed', open: '09:00', close: '17:00', isOpen: true },
            { day: 'Thu', open: '09:00', close: '17:00', isOpen: true },
            { day: 'Fri', open: '09:00', close: '13:00', isOpen: true },
            { day: 'Sat', open: '09:00', close: '17:00', isOpen: false },
            { day: 'Sun', open: '09:00', close: '17:00', isOpen: false },
        ],
        closureDates: []
    },
    {
        id: 'loc-2',
        name: 'Uptown Clinic',
        address: '456 Oak Ave, Anytown, USA',
        timezone: 'GMT',
        phone: '555-5678',
        colorTag: 'bg-green-500',
        openingHours: [
            { day: 'Mon', open: '08:00', close: '18:00', isOpen: true },
            { day: 'Tue', open: '08:00', close: '18:00', isOpen: true },
            { day: 'Wed', open: '08:00', close: '18:00', isOpen: true },
            { day: 'Thu', open: '08:00', close: '18:00', isOpen: true },
            { day: 'Fri', open: '08:00', close: '18:00', isOpen: true },
            { day: 'Sat', open: '10:00', close: '14:00', isOpen: true },
            { day: 'Sun', open: '09:00', close: '17:00', isOpen: false },
        ],
        closureDates: []
    },
];

let surgeries: Surgery[] = [
    { id: 'surg-1', name: 'Surgery 1', locationId: 'loc-1', type: 'surgery', isActive: true },
    { id: 'surg-2', name: 'Surgery 2', locationId: 'loc-1', type: 'surgery', isActive: true },
    { id: 'surg-3', name: 'Hygiene Room A', locationId: 'loc-1', type: 'hygiene', isActive: true },
    { id: 'surg-4', name: 'Surgery 1', locationId: 'loc-2', type: 'surgery', isActive: true },
];

export const locationService = {
    getLocations: (): Location[] => [...locations],
    getSurgeries: (): Surgery[] => [...surgeries],
    getSurgeriesForLocation: (locationId: string): Surgery[] => surgeries.filter(s => s.locationId === locationId),
    saveLocation: (locData: Omit<Location, 'id'> & { id?: string }): Location => {
        if (locData.id) {
            const index = locations.findIndex(l => l.id === locData.id);
            if (index !== -1) {
                locations[index] = { ...locations[index], ...locData, id: locData.id };
                return locations[index];
            }
        }
        const newLocation: Location = { ...locData, id: `loc-${uuidv4()}` };
        locations.push(newLocation);
        return newLocation;
    },
    saveSurgery: (surgData: Omit<Surgery, 'id'> & { id?: string }): Surgery => {
        const newSurgery: Surgery = { ...surgData, id: `surg-${uuidv4()}` };
        surgeries.push(newSurgery);
        return newSurgery;
    },
    isLocationOpen: (locationId: string, date: Date): boolean => {
        const location = locations.find(l => l.id === locationId);
        if (!location) return false;

        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
        const hours = location.openingHours.find(h => h.day === dayOfWeek);

        if (!hours || !hours.isOpen) return false;

        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        return time >= hours.open && time < hours.close;
    },
};
