import React, { useState, FC, useMemo, useEffect } from 'react';
import { SettingsPanel } from './SettingsPage';
import { nhsService } from '../services/nhsService';
import { patientService } from '../services/patientService';
import { useNotifications } from './Notification';
import { Patient, CourseOfTreatment, NhsProcedure } from '../types';

const NhsManagementPage: FC = () => {
    const { addNotification } = useNotifications();
    const [patients] = useState(() => patientService.getPatients());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
    const [activeCoT, setActiveCoT] = useState<CourseOfTreatment | null>(null);
    const [courseHistory, setCourseHistory] = useState<CourseOfTreatment[]>([]);
    const [procedureCodes] = useState(() => nhsService.getNhsProcedureCodes());
    const [selectedProcedure, setSelectedProcedure] = useState<string>(procedureCodes[0]?.code || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (selectedPatient) {
            setActiveCoT(nhsService.getActiveCourseForPatient(selectedPatient.id) || null);
            setCourseHistory(nhsService.getCoursesForPatient(selectedPatient.id));
        } else {
            setActiveCoT(null);
            setCourseHistory([]);
        }
    }, [selectedPatient, isSubmitting]);

    const filteredPatients = useMemo(() => {
        return patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [patients, searchTerm]);

    const handleStartCoT = () => {
        if (!selectedPatient) return;
        try {
            const newCoT = nhsService.startCourseOfTreatment(selectedPatient.id);
            setActiveCoT(newCoT);
            addNotification({ type: 'success', message: 'New Course of Treatment started.' });
        } catch (error: any) {
            addNotification({ type: 'error', message: error.message });
        }
    };

    const handleAddProcedure = () => {
        if (!activeCoT || !selectedProcedure) return;
        try {
            const updatedCoT = nhsService.addProcedureToCourse(activeCoT.id, selectedProcedure);
            setActiveCoT({ ...updatedCoT }); // Create a new object to trigger re-render
            addNotification({ type: 'success', message: 'Procedure added.' });
        } catch (error: any) {
            addNotification({ type: 'error', message: error.message });
        }
    };

    const handleSubmitFp17 = async () => {
        if (!activeCoT || !selectedPatient) return;
        setIsSubmitting(true);
        try {
            await nhsService.submitFp17(activeCoT.id, selectedPatient);
            addNotification({ type: 'success', message: 'FP17 claim submitted successfully.' });
            setActiveCoT(null); // This will refresh via useEffect
        } catch (error: any) {
            addNotification({ type: 'error', message: `Submission failed: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const courseDetails = activeCoT && selectedPatient ? nhsService.calculateCourseDetails(activeCoT, selectedPatient) : null;

    return (
        <SettingsPanel title="NHS Management">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Patient List */}
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

                {/* Details Panel */}
                <div className="md:col-span-2">
                    {selectedPatient ? (
                        <div className="space-y-6">
                            {activeCoT ? (
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h3 className="font-bold text-lg mb-4">Active Course of Treatment (CoT)</h3>
                                    <div className="mb-4 space-y-2">
                                        <p><strong>Procedures:</strong> {activeCoT.procedures.length > 0 ? activeCoT.procedures.map(p => p.description).join(', ') : 'None'}</p>
                                        {courseDetails && (
                                            <div className="flex space-x-4 text-sm">
                                                <span><strong>UDAs:</strong> {courseDetails.udas.toFixed(1)}</span>
                                                <span><strong>Band:</strong> {courseDetails.band}</span>
                                                <span className="font-bold"><strong>Patient Charge:</strong> £{courseDetails.patientCharge.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md border space-y-3">
                                        <h4 className="font-semibold">Add Procedure</h4>
                                        <div className="flex items-center space-x-2">
                                            <select value={selectedProcedure} onChange={e => setSelectedProcedure(e.target.value)} className="flex-grow p-2 border rounded-md">
                                                {procedureCodes.map(p => <option key={p.code} value={p.code}>{p.description} ({p.udas} UDAs)</option>)}
                                            </select>
                                            <button onClick={handleAddProcedure} className="bg-blue-600 text-white px-4 py-2 rounded-md">Add</button>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button 
                                            onClick={handleSubmitFp17} 
                                            disabled={isSubmitting || activeCoT.procedures.length === 0}
                                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Complete & Submit FP17'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-white rounded-lg shadow">
                                    <p className="text-gray-600 mb-4">This patient has no active Course of Treatment.</p>
                                    <button onClick={handleStartCoT} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Start New CoT</button>
                                </div>
                            )}
                            
                             <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="font-bold text-lg mb-4">CoT History</h3>
                                <ul className="space-y-2">
                                {courseHistory.filter(c => c.status === 'completed').map(c => (
                                    <li key={c.id} className="text-sm p-2 border rounded-md bg-gray-50">
                                        <p>Completed on {c.endDate?.toLocaleDateString()} ({c.procedures.length} procedures)</p>
                                        <p className="text-xs text-gray-500">FP17 Claim ID: {c.fp17ClaimId?.split('-')[1].substring(0, 6)}</p>
                                    </li>
                                ))}
                                {courseHistory.filter(c => c.status === 'completed').length === 0 && <p className="text-sm text-gray-500">No completed courses of treatment.</p>}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white rounded-lg shadow">
                            <p className="text-gray-500">Select a patient to manage their NHS treatment.</p>
                        </div>
                    )}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default NhsManagementPage;