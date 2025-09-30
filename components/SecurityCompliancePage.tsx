
import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
// Fix: Corrected import path
import { SecurityPolicies } from '../types';
import { securityService } from '../services/securityService';
import { auditLogService, AuditLogEvent } from '../services/auditLogService';
import { patientService } from '../services/patientService';
import { gdprService } from '../services/gdprService';

type SecurityTab = 'policies' | 'audit' | 'data';

// --- Policies Tab ---
const Policies: FC = () => {
    const { subscriptionPlan } = useApp();
    const { addNotification } = useNotifications();
    const [policies, setPolicies] = useState<SecurityPolicies>(securityService.getPolicies());

    const isEnterprise = subscriptionPlan === 'Enterprise';

    const handleToggle = (key: keyof SecurityPolicies) => {
        setPolicies(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'ipAllowlist') {
            setPolicies(prev => ({ ...prev, ipAllowlist: value.split('\n').filter(ip => ip.trim() !== '') }));
        } else {
            setPolicies(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        securityService.savePolicies(policies);
        addNotification({type: 'success', message: 'Security policies updated successfully.'});
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Access Control</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enforce Strong Passwords</p>
                            <p className="text-sm text-gray-500">Require a mix of letters, numbers, and symbols.</p>
                        </div>
                        <button onClick={() => handleToggle('enforceStrongPasswords')} className={`${policies.enforceStrongPasswords ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}>
                            <span className={`${policies.enforceStrongPasswords ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                        </button>
                    </div>
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enable Multi-Factor Authentication (MFA)</p>
                            <p className="text-sm text-gray-500">Users will need an authenticator app to log in.</p>
                        </div>
                        <button onClick={() => handleToggle('mfaEnabled')} className={`${policies.mfaEnabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}>
                            <span className={`${policies.mfaEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                        </button>
                    </div>
                    <div>
                        <label className="block font-medium">Session Timeout (minutes)</label>
                        <p className="text-sm text-gray-500 mb-1">Automatically log users out after a period of inactivity.</p>
                        <input type="number" name="sessionTimeoutMinutes" value={policies.sessionTimeoutMinutes} onChange={handleInputChange} className="w-full md:w-1/3 p-2 border rounded-md" />
                    </div>
                     <div className={`p-4 rounded-md ${!isEnterprise ? 'bg-gray-100' : ''}`}>
                         <label className="block font-medium">IP Allowlist { !isEnterprise && <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full ml-2">ENTERPRISE</span> }</label>
                        <p className="text-sm text-gray-500 mb-1">Restrict access to specific IP addresses. One per line.</p>
                        <textarea name="ipAllowlist" rows={4} value={policies.ipAllowlist.join('\n')} onChange={handleInputChange} disabled={!isEnterprise} className="w-full p-2 border rounded-md disabled:bg-gray-200" />
                    </div>
                </div>
            </div>
             <div className="flex justify-end">
                <button onClick={handleSave} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Save Policies</button>
            </div>
        </div>
    )
};

// --- Audit Log Tab ---
const AuditLog: FC = () => {
    const allLogs = useMemo(() => auditLogService.getLogs(), []);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');
    const [visibleDetails, setVisibleDetails] = useState<number | null>(null);

    const uniqueUsers = useMemo(() => ['all', ...Array.from(new Set(allLogs.map(log => log.user)))], [allLogs]);

    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            const matchesUser = selectedUser === 'all' || log.user === selectedUser;
            const matchesSearch = searchTerm === '' || 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
            return matchesUser && matchesSearch;
        });
    }, [allLogs, searchTerm, selectedUser]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Search actions or details..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="col-span-1 md:col-span-2 p-2 border rounded-md"/>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="col-span-1 p-2 border rounded-md">
                    {uniqueUsers.map(user => <option key={user} value={user}>{user === 'all' ? 'All Users' : user}</option>)}
                </select>
             </div>
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.map((log, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user} ({log.role})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button onClick={() => setVisibleDetails(visibleDetails === index ? null : index)} className="text-indigo-600 hover:underline">
                                       {visibleDetails === index ? 'Hide' : 'Show'} Details
                                    </button>
                                     {visibleDetails === index && (
                                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded-md max-w-md overflow-auto">{JSON.stringify(log.details, null, 2)}</pre>
                                     )}
                                </td>
                            </tr>
                        ))}
                     </tbody>
                 </table>
             </div>
        </div>
    )
};

// --- Data Management Tab ---
const DataManagement: FC = () => {
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();
    const patients = useMemo(() => patientService.getPatients(), []);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [eraseConfirm, setEraseConfirm] = useState('');

    const handleExport = () => {
        if (!selectedPatientId) return;
        try {
            const data = gdprService.exportPatientData(selectedPatientId);
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

    const handleErase = () => {
        if (!selectedPatientId || eraseConfirm !== 'ERASE') return;
        try {
            const summary = gdprService.erasePatientData(selectedPatientId, currentUser);
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

// --- Main Component ---
const SecurityCompliancePage: FC = () => {
    const [activeTab, setActiveTab] = useState<SecurityTab>('policies');

    const TabButton: FC<{ tabName: SecurityTab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
        >
            {label}
        </button>
    );

    return (
        <SettingsPanel title="Security & Compliance">
            <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <TabButton tabName="policies" label="Policies" />
                    <TabButton tabName="audit" label="Audit Log" />
                    <TabButton tabName="data" label="Data Management" />
                </div>
                <div>
                    {activeTab === 'policies' && <Policies />}
                    {activeTab === 'audit' && <AuditLog />}
                    {activeTab === 'data' && <DataManagement />}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default SecurityCompliancePage;