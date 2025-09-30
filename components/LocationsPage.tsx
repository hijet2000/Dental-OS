import React, { FC, useMemo, useState } from 'react';
import { SettingsPanel } from './SettingsPage';
import { locationService } from '../services/locationService';
import { useNotifications } from './Notification';
import { Location, Surgery, OpeningHour, SubscriptionPlan } from '../types';
import { useApp } from '../hooks/useApp';

// This should be replaced with a real entitlement check in a production app
const LOCATION_QUOTA: Record<SubscriptionPlan, number> = { Basic: 1, Pro: 3, Enterprise: 999 };

const LocationEditor: FC<{ location: Location | null; onSave: (locData: Omit<Location, 'id'> & { id?: string }) => void; onClose: () => void }> = ({ location, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Location, 'id'> & { id?: string }>(
        location || {
            name: '',
            address: '',
            timezone: 'GMT',
            phone: '',
            colorTag: '#4f46e5',
            openingHours: [
                { day: 'Mon', isOpen: true, open: '09:00', close: '17:00' },
                { day: 'Tue', isOpen: true, open: '09:00', close: '17:00' },
                { day: 'Wed', isOpen: true, open: '09:00', close: '17:00' },
                { day: 'Thu', isOpen: true, open: '09:00', close: '17:00' },
                { day: 'Fri', isOpen: true, open: '09:00', close: '17:00' },
                { day: 'Sat', isOpen: false, open: '10:00', close: '14:00' },
                { day: 'Sun', isOpen: false, open: '10:00', close: '14:00' },
            ],
            closureDates: [],
        }
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpeningHoursChange = (day: OpeningHour['day'], field: keyof OpeningHour, value: any) => {
        const newHours = formData.openingHours.map(h =>
            h.day === day ? { ...h, [field]: value } : h
        );
        setFormData({ ...formData, openingHours: newHours });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{location ? 'Edit Location' : 'Add New Location'}</h2>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-2 border rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Color Tag</label>
                                    <input type="color" name="colorTag" value={formData.colorTag} onChange={handleInputChange} className="w-full h-10" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-md font-medium mb-2">Opening Hours</h3>
                                <div className="space-y-2">
                                    {formData.openingHours.map(hour => (
                                        <div key={hour.day} className="grid grid-cols-4 items-center gap-2">
                                            <div className="flex items-center">
                                                <input type="checkbox" checked={hour.isOpen} onChange={e => handleOpeningHoursChange(hour.day, 'isOpen', e.target.checked)} className="mr-2" />
                                                <label className="font-medium">{hour.day}</label>
                                            </div>
                                            <input type="time" value={hour.open} onChange={e => handleOpeningHoursChange(hour.day, 'open', e.target.value)} disabled={!hour.isOpen} className="p-1 border rounded disabled:bg-gray-100" />
                                            <input type="time" value={hour.close} onChange={e => handleOpeningHoursChange(hour.day, 'close', e.target.value)} disabled={!hour.isOpen} className="p-1 border rounded disabled:bg-gray-100" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium">Save Location</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SurgeryManager: FC<{ location: Location, onUpdate: () => void }> = ({ location, onUpdate }) => {
    const surgeries = useMemo(() => locationService.getSurgeriesForLocation(location.id), [location.id, onUpdate]);
    const [newSurgeryName, setNewSurgeryName] = useState('');

    const handleAddSurgery = () => {
        if (!newSurgeryName.trim()) return;
        locationService.saveSurgery({ name: newSurgeryName, locationId: location.id, type: 'surgery', isActive: true });
        setNewSurgeryName('');
        onUpdate();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h3 className="text-lg font-semibold mb-4">Surgeries for {location.name}</h3>
            <ul className="space-y-2">
                {surgeries.map(s => <li key={s.id} className="p-2 border rounded-md">{s.name} ({s.type})</li>)}
            </ul>
            <div className="mt-4 flex space-x-2">
                <input type="text" value={newSurgeryName} onChange={e => setNewSurgeryName(e.target.value)} placeholder="New surgery name..." className="flex-grow p-2 border rounded-md"/>
                <button onClick={handleAddSurgery} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium">Add Surgery</button>
            </div>
        </div>
    );
};


const LocationsPage: FC = () => {
    const { addNotification } = useNotifications();
    const { subscriptionPlan } = useApp();
    
    const [locations, setLocations] = useState(() => locationService.getLocations());
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const locationQuota = LOCATION_QUOTA[subscriptionPlan];
    const canAddLocation = locations.length < locationQuota;

    const handleSaveLocation = (locData: Omit<Location, 'id'> & { id?: string }) => {
        locationService.saveLocation(locData);
        setLocations(locationService.getLocations());
        addNotification({ type: 'success', message: `Location ${locData.id ? 'updated' : 'added'} successfully.` });
        setIsEditorOpen(false);
        setSelectedLocation(null);
    };

    const handleAddNew = () => {
        if (!canAddLocation) {
            addNotification({type: 'error', message: `Your plan is limited to ${locationQuota} location(s). Please upgrade to add more.`});
            return;
        }
        setSelectedLocation(null);
        setIsEditorOpen(true);
    }
    
    const handleEdit = (loc: Location) => {
        setSelectedLocation(loc);
        setIsEditorOpen(true);
    };

    return (
        <SettingsPanel title="Practice & Locations">
            {isEditorOpen && <LocationEditor location={selectedLocation} onSave={handleSaveLocation} onClose={() => setIsEditorOpen(false)} />}
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">Manage your clinic locations, surgeries, and opening hours.</p>
                <button onClick={handleAddNew} className={`bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg ${!canAddLocation ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Add New Location
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map(loc => (
                    <div key={loc.id} className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderLeftColor: loc.colorTag }}>
                        <h3 className="font-bold text-lg">{loc.name}</h3>
                        <p className="text-sm text-gray-600">{loc.address}</p>
                        <p className="text-sm text-gray-600 mt-1">{loc.phone}</p>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => handleEdit(loc)} className="text-sm text-indigo-600 hover:underline">Edit Details</button>
                        </div>
                    </div>
                ))}
            </div>
            
            {locations.length > 0 && (
                <SurgeryManager 
                    key={locations[0].id} 
                    location={locations[0]} 
                    onUpdate={() => setLocations(locationService.getLocations())} 
                />
            )}
        </SettingsPanel>
    );
};

export default LocationsPage;
