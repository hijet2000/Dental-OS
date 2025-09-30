import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { patientService } from '../services/patientService';
import { nhsService } from '../services/nhsService';
import { Patient, CourseOfTreatment, NhsProcedure } from '../types';
import { useNotifications } from './Notification';

// --- Modals ---
const AddProcedureModal: FC<{
    course: CourseOfTreatment;
    onClose: () => void;
    onSave: () => void;
}> = ({ course, onClose, onSave }) => {
    const allCodes = useMemo(() => nhsService.getNhsProcedureCodes(), []);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCodes = useMemo(() => {
        if (!searchTerm) return [];
        return allCodes.filter(c => 
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allCodes]);

    const handleAdd = (code: string) => {
        try {
            nhsService.addProcedureToCourse(course.id, code);
            onSave();
        } catch (error: any) {
            // Handle error, maybe show notification
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
                <h3 className="text-xl font-semibold mb-4">Add NHS Procedure</h3>
                <input
                    type="text"
                    placeholder="Search for NHS procedure..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                />
                <div className="max-h-60 overflow-y-auto border rounded-md">
                    <ul className="divide-y">
                        {filteredCodes.map(code => (
                            <li key={code.code} className="p-2 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{code.code} - {code.description}</p>
                                    <p className="text-xs text-gray-500">Band: {code.band}, UDAs: {code.udas}</p>
                                </div>
                                <button onClick={() => handleAdd(code.code)} className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">Add</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Done</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const NhsManagementPage: FC = () => {
    const { addNotification } = useNotifications();
    const [allPatients] = useState(() => patientService.getPatients());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const filteredPatients = useMemo(() => {
        return allPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allPatients, searchTerm]);

    const patientCourses = useMemo(() => {
        if (!selectedPatient) return [];
        return nhsService.getCoursesForPatient(selectedPatient.id);
    }, [selectedPatient, refreshKey]);

    const activeCourse = useMemo(() => {
        return patientCourses.find(c => c.status === 'active');
    }, [patientCourses]);

    const handleStartCoT = () => {
        if (!selectedPatient) return;
        try {
            nhsService.startCourseOfTreatment(selectedPatient.id);
            addNotification({type: 'success', message: 'New Course of Treatment started.'});
            setRefreshKey(k => k + 1);
        } catch(error: any) {
            addNotification({type: 'error', message: error.message});
        }
    };

    const handleSubmitFp17 = async () => {
        if (!activeCourse || !selectedPatient) return;
        setIsSubmitting(true);
        try {
            await nhsService.submitFp17(activeCourse.id, selectedPatient);
            addNotification({type: 'success', message: 'FP17 claim submitted successfully.'});
            setRefreshKey(k => k + 1);
        } catch(error: any) {
            addNotification({type: 'error', message: `Submission failed: ${error.message}`});
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCourseDetails = (course: CourseOfTreatment) => {
        if (!selectedPatient) return null;
        const details = nhsService.calculateCourseDetails(course, selectedPatient);
        
        return (
            <div className="mt-4 p-4 border bg-gray-50 rounded-md">
                <h4 className="font-semibold mb-2">Course Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500">Total UDAs</p>
                        <p className="text-xl font-bold">{details.udas.toFixed(1)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Treatment Band</p>
                        <p className="text-xl font-bold">{details.band}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Patient Charge</p>
                        <p className="text-xl font-bold">£{details.patientCharge.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <SettingsPanel title="NHS Management">
            {isModalOpen && activeCourse && <AddProcedureModal course={activeCourse} onClose={() => setIsModalOpen(false)} onSave={() => setRefreshKey(k => k + 1)} />}
            <div className="flex h-[calc(100vh-12rem)]">
                 <aside className="w-1/3 border-r pr-4 flex flex-col">
                    <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md mb-4"/>
                    <ul className="space-y-2 overflow-y-auto">
                        {filteredPatients.map(p => (
                            <li key={p.id}>
                                <button onClick={() => setSelectedPatient(p)} className={`w-full text-left p-3 rounded-md border flex items-center space-x-3 ${selectedPatient?.id === p.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white hover:bg-gray-50'}`}>
                                    <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full"/>
                                    <div><p className="font-semibold">{p.name}</p></div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="w-2/3 pl-4 flex flex-col">
                     {selectedPatient ? (
                        <div className="bg-white p-4 rounded-lg border flex-1 flex flex-col">
                            <div className="flex justify-between items-center pb-4 border-b">
                               <div className="flex items-center space-x-4">
                                   <img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className="w-16 h-16 rounded-full"/>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                                        <p className="font-semibold text-blue-600">NHS Status: {selectedPatient.nhsStatus}</p>
                                    </div>
                               </div>
                               {!activeCourse && <button onClick={handleStartCoT} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm">Start New Course of Treatment</button>}
                            </div>
                            <div className="py-4 overflow-y-auto flex-1">
                                {activeCourse ? (
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Active Course of Treatment</h3>
                                            <button onClick={() => setIsModalOpen(true)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Add Procedure</button>
                                        </div>
                                        <ul className="mt-2 space-y-2">
                                            {activeCourse.procedures.map((p, i) => (
                                                <li key={i} className="p-2 bg-gray-100 rounded text-sm">{p.code} - {p.description}</li>
                                            ))}
                                        </ul>
                                        {renderCourseDetails(activeCourse)}
                                        <div className="mt-6 flex justify-end">
                                            <button onClick={handleSubmitFp17} disabled={isSubmitting || activeCourse.procedures.length === 0} className="bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">
                                                {isSubmitting ? 'Submitting...' : 'Complete & Submit FP17'}
                                            </button>
                                        </div>
                                    </div>
                                ) : <p className="text-gray-500">This patient has no active course of treatment.</p>}
                                <hr className="my-6"/>
                                <h3 className="text-lg font-semibold">Completed Courses</h3>
                                <ul className="mt-2 space-y-2">
                                     {patientCourses.filter(c => c.status === 'completed').map(c => (
                                        <li key={c.id} className="p-3 bg-gray-50 rounded border">
                                            <p className="font-semibold">CoT from {new Date(c.startDate).toLocaleDateString()}</p>
                                            <p className="text-xs">Claim ID: {c.fp17ClaimId}</p>
                                        </li>
                                     ))}
                                </ul>
                            </div>
                        </div>
                     ) : (
                         <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg"><p className="text-gray-500">Select a patient to view their NHS treatment history.</p></div>
                     )}
                </main>
            </div>
        </SettingsPanel>
    );
};

export default NhsManagementPage;