import React, { useState, FC, useEffect } from 'react';
import { SettingsPanel } from './SettingsPage';
import { qualityService } from '../services/qualityService';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { useNotifications } from './Notification';
import { LabCase, Complaint, Lab } from '../types';
import { SparklesIcon, ArrowPathIcon, BeakerIcon, ChatBubbleBottomCenterTextIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

type QualityTab = 'labs' | 'complaints';

// --- Sub-Components ---

const LabWork: FC<{ labs: Lab[], cases: LabCase[] }> = ({ labs, cases }) => {
    const { addNotification } = useNotifications();
    const [loadingChase, setLoadingChase] = useState<string | null>(null);

    const handleChase = async (labCase: LabCase) => {
        setLoadingChase(labCase.id);
        const lab = labs.find(l => l.id === labCase.labId);
        if (!lab) return;

        try {
            const daysOverdue = Math.floor((new Date().getTime() - labCase.dueDate.getTime()) / (1000 * 3600 * 24));
            // FIX: Provide both generic type arguments to runTask.
            const result = await aiOrchestrationService.runTask<{ subject: string, body: string }, 'LAB_CHASE_EMAIL'>('LAB_CHASE_EMAIL', {
                labName: lab.name,
                caseType: labCase.caseType,
                daysOverdue: Math.max(1, daysOverdue),
            });
            console.log('Generated Email:', result);
            addNotification({ type: 'info', message: `Email for ${lab.name} generated.`});
        } catch (error: any) {
             addNotification({ type: 'error', message: `AI failed: ${error.message}`});
        } finally {
            setLoadingChase(null);
        }
    };

    const getStatusStyles = (status: LabCase['status']) => {
        if (status === 'overdue') return 'bg-red-100 text-red-800';
        if (status === 'received') return 'bg-green-100 text-green-800';
        return 'bg-blue-100 text-blue-800';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Case</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lab</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {cases.map(c => (
                        <tr key={c.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.patientName} ({c.caseType})</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{labs.find(l => l.id === c.labId)?.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{c.dueDate.toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm"><span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(c.status)}`}>{c.status}</span></td>
                            <td className="px-6 py-4 text-sm">
                                {c.status === 'overdue' && (
                                    <button 
                                        onClick={() => handleChase(c)}
                                        disabled={loadingChase === c.id}
                                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 text-xs flex items-center"
                                    >
                                        {loadingChase === c.id ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-1"/> : <SparklesIcon className="w-4 h-4 mr-1"/>}
                                        AI Chase
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Complaints: FC<{ complaints: Complaint[] }> = ({ complaints }) => {
    const { addNotification } = useNotifications();
    const [newComplaint, setNewComplaint] = useState('');
    const [loadingTriage, setLoadingTriage] = useState(false);
    const [triageResult, setTriageResult] = useState<any>(null);

    const handleTriage = async () => {
        if (!newComplaint) return;
        setLoadingTriage(true);
        setTriageResult(null);
        try {
            const result = await aiOrchestrationService.runTask('COMPLAINT_TRIAGE', { description: newComplaint });
            setTriageResult(result);
        } catch (error: any) {
             addNotification({ type: 'error', message: `AI Triage failed: ${error.message}`});
        } finally {
            setLoadingTriage(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Open Complaints</h3>
                 <div className="bg-white shadow rounded-lg divide-y">
                     {complaints.filter(c=>c.status !== 'resolved').map(c => (
                        <div key={c.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-800">{c.description}</p>
                                <span className="text-xs font-semibold capitalize text-red-800 bg-red-100 px-2 py-1 rounded-full">{c.severity}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Patient: {c.patientName} | Category: {c.category}</p>
                        </div>
                     ))}
                 </div>
            </div>
            <div>
                 <h3 className="text-lg font-medium text-gray-900 mb-4">AI Triage</h3>
                 <div className="bg-white shadow rounded-lg p-4">
                    <textarea value={newComplaint} onChange={e => setNewComplaint(e.target.value)} placeholder="Enter new complaint description..." className="w-full p-2 border rounded-md text-sm" rows={4}></textarea>
                    <button onClick={handleTriage} disabled={loadingTriage || !newComplaint} className="w-full mt-2 bg-purple-600 text-white px-4 py-2 text-sm rounded-md flex items-center justify-center disabled:bg-purple-300">
                        {loadingTriage ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2"/> : <SparklesIcon className="w-5 h-5 mr-2"/>}
                        Triage with AI
                    </button>
                    {triageResult && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-md text-xs space-y-2">
                            <p><strong>Suggested Severity:</strong> {triageResult.severity}</p>
                            <p><strong>Suggested Category:</strong> {triageResult.category}</p>
                            <div>
                                <strong>Action Plan:</strong>
                                <ul className="list-disc list-inside ml-2">
                                    {triageResult.actionPlan.map((step: string, i: number) => <li key={i}>{step}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const QualityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<QualityTab>('labs');
    const [isLoading, setIsLoading] = useState(true);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [cases, setCases] = useState<LabCase[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const { addNotification } = useNotifications();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [labsData, casesData, complaintsData] = await Promise.all([
                    qualityService.getLabs(),
                    qualityService.getLabCases(),
                    qualityService.getComplaints()
                ]);
                setLabs(labsData);
                setCases(casesData);
                setComplaints(complaintsData);
            } catch (error) {
                addNotification({ type: 'error', message: 'Failed to load quality data.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [addNotification]);

    const TabButton: FC<{ tabName: QualityTab; label: string, icon: FC<any> }> = ({ tabName, label, icon: Icon }) => (
         <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );

    return (
        <SettingsPanel title="Quality Management">
             <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <TabButton tabName="labs" label="Lab Work" icon={BeakerIcon} />
                    <TabButton tabName="complaints" label="Complaints" icon={ChatBubbleBottomCenterTextIcon} />
                </div>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="mt-4">
                        {activeTab === 'labs' && <LabWork labs={labs} cases={cases} />}
                        {activeTab === 'complaints' && <Complaints complaints={complaints} />}
                    </div>
                )}
            </div>
        </SettingsPanel>
    );
};

export default QualityPage;