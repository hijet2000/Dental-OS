
import React, { useState, FC, useMemo } from 'react';
import { useApp } from '../../hooks/useApp';
import { useNotifications } from '../Notification';
import { patientService } from '../../services/patientService';
import { gdprService } from '../../services/gdprService';

const DataManagementTab: FC = () => {
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();
    const patients = useMemo(() => patientService.getPatients(), []);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [eraseConfirm, setEraseConfirm] = useState('');

    const handleExport = async () => {
        if (!selectedPatientId) return;
        try {
            // FIX: Await the async call to exportPatientData
            const data = await gdprService.exportPatientData(selectedPatientId);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `patient_${selectedPatientId}_export.json`;
            link.click();
            URL.revokeObjectURL(url);
            addNotification({type: 'success', message: 'Patient data export generated.'});
        } catch (error: any) {
            addNotification({type: 'error', message: `Export failed: ${error.message}`});
        }
    };

    const handleErase = async () => {
        if (!selectedPatientId || eraseConfirm !== 'ERASE') return;
        try {
            // FIX: Await the async call to erasePatientData
            const summary = await gdprService.erasePatientData(selectedPatientId, currentUser);
            addNotification({type: 'success', message: `Erasure complete. ${summary}`});
            setSelectedPatientId('');
            setEraseConfirm('');
        } catch (error: any)
        {
             addNotification({type: 'error', message: `Erasure failed: ${error.message}`});
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-1">Data Subject Requests (GDPR)</h3>
                <p className="text-sm text-gray-500 mb-4">Export or erase patient data.</p>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Select Patient</label>
                    <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                        <option value="" disabled>-- Choose a patient --</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                {selectedPatientId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-md">
                            <h4 className="font-semibold">Right to Data Portability</h4>
                            <p className="text-xs text-gray-500 mb-2">Export all data for this patient as a JSON file.</p>
                            <button onClick={handleExport} className="bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm">Export Data</button>
                        </div>
                        <div className="p-4 border border-red-300 rounded-md bg-red-50">
                             <h4 className="font-semibold text-red-800">Right to Erasure</h4>
                             <p className="text-xs text-red-700 mb-2">This will permanently delete personal data and anonymize associated records. This action cannot be undone.</p>
                             <label className="block text-sm font-medium text-gray-700 mt-2">To confirm, type ERASE below:</label>
                             <input type="text" value={eraseConfirm} onChange={e => setEraseConfirm(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                             <button onClick={handleErase} disabled={eraseConfirm !== 'ERASE'} className="mt-2 bg-red-600 text-white font-bold py-2 px-4 rounded text-sm disabled:bg-gray-400">Erase Patient Data</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default DataManagementTab;
