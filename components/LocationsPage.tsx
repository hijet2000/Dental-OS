import React, { FC, useMemo, useState } from 'react';
import { SettingsPanel } from './SettingsPage';
import { locationService } from '../services/locationService';
import { useNotifications } from './Notification';
import { Location, Surgery } from '../types';
import { useApp } from '../hooks/useApp';
// This should be replaced with a real entitlement check in a production app
const FAKE_LOCATION_QUOTA = { Basic: 1, Pro: 3, Enterprise: 999 };

const LocationEditor: FC<{ location: Location | null; onSave: (loc: Location) => void; onClose: () => void }> = ({ location, onSave, onClose }) => {
    const [formData, setFormData] = useState<Location>(
        location || {
            id: '', name: '', address: '', timezone: 'GMT', phone: '', colorTag: 'bg-blue-500',
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
        }
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: any) => {
        const newHours = formData.openingHours.map(h => 
            h.day === day ? { ...h, [field]: value } : h
        );
        setFormData({ ...formData, openingHours: newHours });
    };
    
    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">{location ? 'Edit' : 'Add'} Location</h3>
                {/* Form fields */}
                <div className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Location Name" className="w-full p-2 border rounded" />
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full p-2 border rounded" />
                    {/* Opening Hours */}
                    <div>
                        <h4 className="font-semibold">Opening Hours</h4>
                        {formData.openingHours.map(h => (
                            <div key={h.day} className="flex items-center space-x-2 my-1">
                                <label className="w-12">{h.day}</label>
                                <input type="checkbox" checked={h.isOpen} onChange={e => handleOpeningHoursChange(h.day, 'isOpen', e.target.checked)} />
                                <input type="time" value={h.open} disabled={!h.isOpen} onChange={e => handleOpeningHoursChange(h.day, 'open', e.target.value)} className="p-1 border rounded" />
                                <span>-</span>
                                <input type="time" value={h.close} disabled={!h.isOpen} onChange={e => handleOpeningHoursChange(h.day, 'close', e.target.value)} className="p-1 border rounded" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save</button>
                </div>
            </div>
        </div>
    );
};

const SurgeryManager: FC<{ location: Location }> = ({ location }) => {
    const [surgeries, setSurgeries] = useState(() => locationService.getSurgeriesForLocation(location.id));
    const [newSurgeryName, setNewSurgeryName] = useState('');

    const handleAddSurgery = () => {
        if (!newSurgeryName.trim()) return;
        locationService.saveSurgery({ name: newSurgeryName, locationId: location.id, type: 'surgery', isActive: true });
        setSurgeries(locationService.getSurgeriesForLocation(location.id));
        setNewSurgeryName('');
    };
    
    return (
        <div className="mt-4">
            <h4 className="font-semibold">Surgeries at {location.name} ({surgeries.length})</h4>
            <ul className="divide-y my-2">
                {surgeries.map(s => <li key={s.id} className="py-1">{s.name} ({s.type})</li>)}
            </ul>
             <div className="flex space-x-2">
                <input value={newSurgeryName} onChange={e => setNewSurgeryName(e.target.value)} placeholder="New Surgery Name" className="flex-grow p-2 border rounded-md"/>
                <button onClick={handleAddSurgery} className="bg-indigo-500 text-white px-4 rounded-md">Add</button>
            </div>
        </div>
    );
};

const LocationsPage: FC = () => {
    const { addNotification } = useNotifications();
    const { subscriptionPlan } = useApp();
    const [locations, setLocations] = useState(() => locationService.getLocations());
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const locationQuota = FAKE_LOCATION_QUOTA[subscriptionPlan];
    const canAddLocation = locations.length < locationQuota;

    const handleSaveLocation = (loc: Location) => {
        locationService.saveLocation(loc);
        setLocations(locationService.getLocations());
        addNotification({ type: 'success', message: `Location '${loc.name}' saved.`});
    };
    
    const handleAddClick = () => {
        if (!canAddLocation) {
            addNotification({type: 'error', message: `Your ${subscriptionPlan} plan is limited to ${locationQuota} location(s). Please upgrade.`});
            return;
        }
        setIsAdding(true);
    };

    return (
        <SettingsPanel title="Practice & Locations">
            {(isAdding || editingLocation) && (
                <LocationEditor 
                    location={editingLocation}
                    onClose={() => { setEditingLocation(null); setIsAdding(false); }}
                    onSave={handleSaveLocation}
                />
            )}
            <div className="flex justify-end mb-4">
                <button onClick={handleAddClick} className={`bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg ${!canAddLocation ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Add New Location
                </button>
            </div>
            <div className="space-y-6">
                {locations.map(loc => (
                    <div key={loc.id} className="bg-white p-6 rounded-lg shadow">
                         <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-semibold flex items-center">
                                    <span className={`w-4 h-4 rounded-full ${loc.colorTag} mr-2`}></span>
                                    {loc.name}
                                </h3>
                                <p className="text-sm text-gray-500">{loc.address}</p>
                            </div>
                            <button onClick={() => setEditingLocation(loc)} className="text-sm text-indigo-600 hover:underline">Edit</button>
                         </div>
                         <SurgeryManager location={loc} />
                    </div>
                ))}
            </div>
        </SettingsPanel>
    );
};

export default LocationsPage;