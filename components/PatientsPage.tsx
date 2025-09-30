
import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { patientService } from '../services/patientService';
import { clinicalService } from '../services/clinicalService';
// Fix: Corrected import path
import { Patient, ClinicalNote, NhsStatus } from '../types';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';

type PatientTab = 'details' | 'notes';
const ALL_NHS_STATUSES: NhsStatus[] = ['Paying', 'Exempt - Under 18', 'Exempt - Universal Credit', 'Not Applicable'];

const ClinicalNoteModal: FC<{
    note: ClinicalNote | null;
    patientId: string;
    onClose: () => void;
    onSave: () => void;
}> = ({ note, patientId, onClose, onSave }) => {
    const { currentUser } = useApp();
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;
        if (note) {
            // Update existing note
            clinicalService.updateNote(note.id, { title, content });
        } else {
            // Create new note
            clinicalService.addNote({ patientId, authorId: currentUser.id, title, content });
        }
        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4">{note ? 'Edit' : 'New'} Clinical Note</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Note Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                    <textarea
                        placeholder="Enter clinical details..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save Note</button>
                </div>
            </div>
        </div>
    );
};


const PatientsPage: FC = () => {
    const { addNotification } = useNotifications();
    const [allPatients, setAllPatients] = useState(() => patientService.getPatients());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<PatientTab>('details');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);

    const filteredPatients = useMemo(() => {
        return allPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allPatients, searchTerm]);

    const patientNotes = useMemo(() => {
        if (!selectedPatient) return [];
        return clinicalService.getNotesForPatient(selectedPatient.id);
    }, [selectedPatient, isNoteModalOpen]); // Rerun when modal closes
    
    const handleSaveNote = () => {
        addNotification({type: 'success', message: 'Clinical note saved.'});
        // Force refresh of notes
        if(selectedPatient) setSelectedPatient(patientService.getPatientById(selectedPatient.id) || null);
    };

    const handleNhsStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (selectedPatient) {
            const newStatus = e.target.value as NhsStatus;
            const updatedPatient = patientService.updatePatientNhsStatus(selectedPatient.id, newStatus);
            if (updatedPatient) {
                setSelectedPatient(updatedPatient);
                setAllPatients(patientService.getPatients()); // Refresh list
                addNotification({type: 'success', message: 'NHS status updated.'});
            }
        }
    };

    return (
        <SettingsPanel title="Clinical Records">
             {isNoteModalOpen && selectedPatient && (
                <ClinicalNoteModal
                    note={editingNote}
                    patientId={selectedPatient.id}
                    onClose={() => { setIsNoteModalOpen(false); setEditingNote(null); }}
                    onSave={handleSaveNote}
                />
            )}
            <div className="flex h-[calc(100vh-12rem)]">
                {/* Left Panel: Patient List */}
                <aside className="w-1/3 border-r pr-4 flex flex-col">
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4"
                    />
                    <ul className="space-y-2 overflow-y-auto">
                        {filteredPatients.map(p => (
                            <li key={p.id}>
                                <button
                                    onClick={() => setSelectedPatient(p)}
                                    className={`w-full text-left p-3 rounded-md border flex items-center space-x-3 ${selectedPatient?.id === p.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-semibold">{p.name}</p>
                                        <p className="text-xs text-gray-500">DOB: {p.dateOfBirth.toLocaleDateString()}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Right Panel: Patient Details */}
                <main className="w-2/3 pl-4 flex flex-col">
                    {selectedPatient ? (
                        <div className="bg-white p-4 rounded-lg border flex-1 flex flex-col">
                           <div className="flex items-center space-x-4 pb-4 border-b">
                                <img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className="w-16 h-16 rounded-full"/>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                                    <p className="text-sm text-gray-500">DOB: {selectedPatient.dateOfBirth.toLocaleDateString()} | Gender: {selectedPatient.gender}</p>
                                </div>
                           </div>
                           <div className="border-b">
                                <nav className="flex space-x-4" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('details')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'details' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                        Details
                                    </button>
                                    <button onClick={() => setActiveTab('notes')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'notes' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                        Clinical Notes ({patientNotes.length})
                                    </button>
                                </nav>
                           </div>
                           <div className="py-4 overflow-y-auto flex-1">
                                {activeTab === 'details' && (
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <label className="font-semibold text-gray-600">Allergies:</label>
                                            <p>{selectedPatient.allergies.join(', ') || 'None reported'}</p>
                                        </div>
                                        <div>
                                            <label className="font-semibold text-gray-600">Medical History:</label>
                                            <p>{selectedPatient.medicalHistory.join(', ') || 'None reported'}</p>
                                        </div>
                                        <div>
                                            <label className="font-semibold text-gray-600">NHS Status:</label>
                                            <select value={selectedPatient.nhsStatus} onChange={handleNhsStatusChange} className="w-full md:w-1/2 p-1 border rounded-md">
                                                {ALL_NHS_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'notes' && (
                                    <div>
                                        <div className="flex justify-end mb-2">
                                            <button onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm">
                                                Add New Note
                                            </button>
                                        </div>
                                        <ul className="space-y-3">
                                            {patientNotes.map(note => (
                                                <li key={note.id} className="p-3 bg-gray-50 rounded-md border">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold">{note.title}</h4>
                                                        <span className="text-xs text-gray-500">{note.timestamp.toLocaleString()} by {note.author?.name || 'Unknown'}</span>
                                                    </div>
                                                    <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                           </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg"><p className="text-gray-500">Select a patient to view their clinical record.</p></div>
                    )}
                </main>
            </div>
        </SettingsPanel>
    );
};

export default PatientsPage;
