

import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { patientService } from '../services/patientService';
import { clinicalService } from '../services/clinicalService';
import { Patient, ClinicalNote, User } from '../types';

const PatientDetailPage: FC<{ patient: Patient }> = ({ patient }) => {
    const clinicalNotes = useMemo(() => clinicalService.getNotesForPatient(patient.id), [patient.id]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
                <img src={patient.avatarUrl} alt={patient.name} className="w-20 h-20 rounded-full mr-6" />
                <div>
                    <h2 className="text-2xl font-bold">{patient.name}</h2>
                    <p className="text-gray-600">{patient.email} | {patient.phone}</p>
                    <p className="text-sm text-gray-500">DOB: {patient.dateOfBirth.toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Clinical Notes</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {clinicalNotes.length > 0 ? clinicalNotes.map(note => (
                        <div key={note.id} className="bg-gray-50 p-3 rounded-md border">
                            <p className="font-semibold text-sm">{note.title}</p>
                            <p className="text-xs text-gray-500">By {note.author?.name || 'Unknown'} on {note.timestamp.toLocaleString()}</p>
                            <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">No clinical notes for this patient.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PatientsPage: FC = () => {
    const [patients] = useState(() => patientService.getPatients());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = useMemo(() => {
        return patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [patients, searchTerm]);

    return (
        <SettingsPanel title="Patient Management">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4"
                    />
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {filteredPatients.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPatient(p)}
                                className={`w-full text-left p-3 rounded-md flex items-center ${selectedPatient?.id === p.id ? 'bg-indigo-100' : 'bg-white hover:bg-gray-50'}`}
                            >
                                <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full mr-3" />
                                <div>
                                    <p className="font-semibold">{p.name}</p>
                                    <p className="text-sm text-gray-500">{p.nhsNumber}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2">
                    {selectedPatient ? (
                        <PatientDetailPage patient={selectedPatient} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white rounded-lg shadow">
                            <p className="text-gray-500">Select a patient to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default PatientsPage;