
import { MOCK_LOCATIONS, MOCK_SURGERIES } from '../constants';
import { Location, Surgery } from '../types';
import { v4 as uuidv4 } from 'uuid';

let locations: Location[] = JSON.parse(JSON.stringify(MOCK_LOCATIONS));
let surgeries: Surgery[] = JSON.parse(JSON.stringify(MOCK_SURGERIES));

export const locationService = {
    getLocations: (): Location[] => [...locations],
    
    getLocationById: (id: string): Location | undefined => locations.find(l => l.id === id),
    
    saveLocation: (loc: Omit<Location, 'id'> & { id?: string }): Location => {
        if (loc.id) {
            const index = locations.findIndex(l => l.id === loc.id);
            if (index !== -1) {
                locations[index] = { ...locations[index], ...loc, id: loc.id };
                return locations[index];
            }
        }
        const newLocation: Location = { ...loc, id: `loc-${uuidv4()}` };
        locations.push(newLocation);
        return newLocation;
    },
    
    getSurgeriesForLocation: (locationId: string): Surgery[] => {
        return surgeries.filter(s => s.locationId === locationId);
    },
    
    saveSurgery: (surgery: Omit<Surgery, 'id'> & { id?: string }): Surgery => {
         if (surgery.id) {
            const index = surgeries.findIndex(s => s.id === surgery.id);
            if (index !== -1) {
                surgeries[index] = { ...surgeries[index], ...surgery, id: surgery.id };
                return surgeries[index];
            }
        }
        const newSurgery: Surgery = { ...surgery, id: `surg-${uuidv4()}` };
        surgeries.push(newSurgery);
        return newSurgery;
    },

    isLocationOpen: (locationId: string, dateTime: Date): boolean => {
        // This is a simplified check. A real implementation would be more robust.
        const location = locations.find(l => l.id === locationId);
        if (!location || !location.openingHours) return false;
        
        const day = dateTime.toLocaleString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
        const hours = location.openingHours.find(h => h.day === day);

        if (!hours || !hours.isOpen) return false;
        
        // This check is basic and doesn't account for timezone.
        const time = dateTime.toTimeString().substring(0, 5);
        return time >= hours.open && time < hours.close;
    }
};