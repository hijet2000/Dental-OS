import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
import { hasPermission } from '../services/rbacService';
import { AITaskType, AddonKey, PermissionKey, UserRole, IconComponent, SubscriptionPlan } from '../types';
// Fix: Import MOCK_USERS from constants to resolve reference error
import { AI_TASK_CONFIG, PLANS_CONFIG, ADDONS_CONFIG, ALL_USER_ROLES, ROLES_CONFIG, MOCK_USERS } from '../constants';
import {
    CogIcon, SparklesIcon, TerminalIcon, TrashIcon, UserIcon, ChartPieIcon, PresentationChartBarIcon, BuildingStorefrontIcon,
    UsersIcon, CreditCardIcon, CpuChipIcon, PaintBrushIcon, ShieldCheckIcon, BellIcon, FolderIcon, BeakerIcon, FlagIcon, ForwardIcon,
    UserGroupIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ArrowDownTrayIcon,
    ArchiveBoxIcon, KeyIcon, LockClosedIcon, DocumentMagnifyingGlassIcon, WrenchScrewdriverIcon, QrCodeIcon, ClipboardDocumentCheckIcon,
    SunIcon, MoonIcon, ArrowPathIcon, EyeIcon, CalendarIcon, VariableIcon, LightBulbIcon, EnvelopeIcon, TrophyIcon, PrinterIcon,
    TableCellsIcon, CloudArrowUpIcon
} from './icons';
import { fileToBase64 } from '../utils';

type TabId = 'dashboard' | 'practice' | 'users' | 'billing' | 'inventory' | 'tasks' | 'appointments' | 'staff' | 'compliance' | 'labs' | 'files' | 'branding' | 'security' | 'ai' | 'qa';

const TABS: { id: TabId; label: string; icon: IconComponent; permission: PermissionKey }[] = [
    { id: 'dashboard', label: 'Dashboard & Reports', icon: ChartPieIcon, permission: PermissionKey.VIEW_DASHBOARD },
    { id: 'practice', label: 'Practice & Locations', icon: BuildingStorefrontIcon, permission: PermissionKey.VIEW_DASHBOARD },
    { id: 'users', label: 'Users & Roles', icon: UsersIcon, permission: PermissionKey.MANAGE_USERS },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCardIcon, permission: PermissionKey.MANAGE_SUBSCRIPTION },
    { id: 'inventory', label: 'Inventory & Equipment', icon: ArchiveBoxIcon, permission: PermissionKey.VIEW_INVENTORY },
    { id: 'tasks', label: 'Tasks & QR Areas', icon: QrCodeIcon, permission: PermissionKey.VIEW_TASKS },
    { id: 'appointments', label: 'Messaging & Alerts', icon: ChatBubbleLeftRightIcon, permission: PermissionKey.VIEW_APPOINTMENTS },
    { id: 'staff', label: 'Staff & Kiosk', icon: UserGroupIcon, permission: PermissionKey.VIEW_STAFF_LIST },
    { id: 'compliance', label: 'Compliance & Audits', icon: ClipboardDocumentCheckIcon, permission: PermissionKey.VIEW_COMPLIANCE_TASKS },
    { id: 'labs', label: 'Labs & Complaints', icon: BeakerIcon, permission: PermissionKey.VIEW_LAB_CASES },
    { id: 'files', label: 'Files & Backup', icon: FolderIcon, permission: PermissionKey.MANAGE_FILES },
    { id: 'branding', label: 'Appearance & Branding', icon: PaintBrushIcon, permission: PermissionKey.MANAGE_BRANDING },
    { id: 'security', label: 'Security & Sync', icon: ShieldCheckIcon, permission: PermissionKey.MANAGE_SECURITY },
    { id: 'ai', label: 'AI & Integrations', icon: CpuChipIcon, permission: PermissionKey.RUN_AI_TASKS },
    { id: 'qa', label: 'QA & DevOps', icon: FlagIcon, permission: PermissionKey.MANAGE_QA_DEVOPS },
];


const SettingsPage: React.FC = () => {
    const app = useApp();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    
    const { currentUser, role, subscription, handleUserChange, notifications } = app;
    
    // Filter tabs based on user permissions
    const accessibleTabs = TABS.filter(tab => hasPermission(role, tab.permission));
    
    // Effect to switch to a default tab if the current one is no longer accessible
    useEffect(() => {
        if (!accessibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(accessibleTabs[0]?.id || 'dashboard');
        }
    }, [role, activeTab, accessibleTabs]);
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardTab />;
            case 'ai':
                return <AITaskRunnerTab />;
            // Add other tab components here
            default:
                return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">{TABS.find(t=>t.id === activeTab)?.label}</h2><p>This module is under construction.</p></div>;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <CogIcon className="w-8 h-8 mr-3 text-brand-primary" /> Dental OS
                    </h1>
                    <div className="flex items-center space-x-6">
                         {/* Notification Bell */}
                        <div className="relative">
                            <button className="text-gray-500 hover:text-gray-700">
                                <BellIcon className="w-6 h-6" />
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                )}
                            </button>
                        </div>
                        {/* User Switcher */}
                        <div className="flex items-center space-x-2">
                            <UserIcon className="w-6 h-6 text-gray-500" />
                            <select
                                value={currentUser}
                                onChange={(e) => handleUserChange(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md bg-white text-sm"
                            >
                                {Object.keys(MOCK_USERS).map(email => (
                                    <option key={email} value={email}>{email}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="max-w-screen-2xl mx-auto flex">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white border-r border-gray-200 p-4 space-y-1">
                    {accessibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                activeTab === tab.id
                                ? 'bg-brand-light text-brand-dark'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-brand-secondary' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 p-6 lg:p-8">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
};


// --- TAB COMPONENTS ---

const DashboardTab: React.FC = () => {
    // In a real app, this would be populated with data from useApp hook
    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700">Appointments Today</h3>
                    <p className="text-3xl font-bold">12</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700">Low Stock Items</h3>
                    <p className="text-3xl font-bold text-yellow-600">2</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700">Open Complaints</h3>
                    <p className="text-3xl font-bold text-red-600">1</p>
                </div>
            </div>
        </div>
    )
}

const AITaskRunnerTab: React.FC = () => {
    const { role, subscription, aiLogs, handleClearLogs, runAiTask } = useApp();
    const { addNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<AITaskType>(AITaskType.SUMMARIZE_MEETING_NOTES);
    const [taskInput, setTaskInput] = useState('Please summarize our weekly sync. John will handle the Q3 budget report. Sarah is to follow up with the marketing team on the new campaign. We need to finalize the roadmap by Friday.');
    const [taskOutput, setTaskOutput] = useState<any | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            try {
                const data = await fileToBase64(file);
                setImageBase64(data);
            } catch {
                addNotification({ type: 'error', message: 'Failed to read image file.' });
            }
        }
    };

    const handleRunTask = useCallback(async () => {
        if (!hasPermission(role, PermissionKey.RUN_AI_TASKS)) {
            addNotification({ type: 'error', message: "You don't have permission." });
            return;
        }
        setIsLoading(true);
        setTaskOutput(null);
        try {
            let payload: any;
            if (AI_TASK_CONFIG[selectedTask].requiresImage) {
                if (!imageBase64 || !imageFile) {
                    addNotification({ type: 'error', message: "Please upload an image." });
                    setIsLoading(false);
                    return;
                }
                payload = { image: imageBase64, imageMimeType: imageFile.type };
            } else {
                // Simplified payload creation for demo
                payload = { notes: taskInput, feedback: taskInput, patientName: 'Jane Doe', visitReason: 'check-up', instructions: taskInput };
            }

            const result = await runAiTask(selectedTask, payload);
            setTaskOutput(result);
            addNotification({ type: 'success', message: 'AI task completed!' });
        } catch (error: any) {
            addNotification({ type: 'error', message: `Task failed: ${error.message}` });
            setTaskOutput({ error: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [selectedTask, taskInput, role, imageBase64, imageFile, runAiTask, addNotification]);
    
    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTask = e.target.value as AITaskType;
        setSelectedTask(newTask);
        setTaskOutput(null);
        setImageFile(null);
        setImageBase64(null);
    };
    
    const planLimits = PLANS_CONFIG[subscription.plan].limits;
    const totalAddonAiCalls = Object.entries(subscription.purchasedAddons)
        .reduce((sum, [key, quantity]) => {
            const addonConfig = ADDONS_CONFIG[key as AddonKey];
            if (addonConfig && addonConfig.aiCalls) {
                return sum + (addonConfig.aiCalls * Number(quantity));
            }
            return sum;
        }, 0);
    const totalAiCallLimit = planLimits.aiCalls + totalAddonAiCalls;
    const usagePercentage = (subscription.usage.aiCalls / totalAiCallLimit) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold mb-4 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-indigo-500" /> AI & Integrations</h2>
                <div className="mb-4">
                    <label htmlFor="task-select" className="block text-sm font-medium text-gray-700 mb-1">Select AI Task</label>
                    <select id="task-select" className="w-full p-2 border border-gray-300 rounded-md" value={selectedTask} onChange={handleTaskChange}>
                        {Object.values(AITaskType).map(task => (<option key={task} value={task}>{AI_TASK_CONFIG[task].name}</option>))}
                    </select>
                </div>
                {AI_TASK_CONFIG[selectedTask].requiresImage ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        {imageBase64 && <img src={`data:${imageFile?.type};base64,${imageBase64}`} alt="Preview" className="max-h-48 mt-4 rounded-md" />}
                    </div>
                ) : (
                    <textarea rows={6} className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm" value={taskInput} onChange={e => setTaskInput(e.target.value)} />
                )}
                <button onClick={handleRunTask} disabled={isLoading || !hasPermission(role, PermissionKey.RUN_AI_TASKS)} className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                    {isLoading ? 'Processing...' : 'Run Task'}
                </button>
                {taskOutput && (
                    <div className="mt-6"><h3 className="text-lg font-semibold">Output</h3><pre className="bg-gray-100 p-4 rounded-md text-sm mt-2">{JSON.stringify(taskOutput, null, 2)}</pre></div>
                )}
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
                    <p><strong>Plan:</strong> <span className="font-semibold text-indigo-600">{PLANS_CONFIG[subscription.plan].name}</span></p>
                    <div className="mt-2">
                        <div className="flex justify-between text-sm"><span className="font-medium">AI Calls Usage</span><span>{subscription.usage.aiCalls} / {totalAiCallLimit}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(usagePercentage, 100)}%` }}></div></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center"><TerminalIcon className="w-5 h-5 mr-2" /> AI Logs</h3>
                        {hasPermission(role, PermissionKey.CLEAR_AI_LOGS) && (<button onClick={handleClearLogs} className="text-red-500"><TrashIcon className="w-5 h-5" /></button>)}
                    </div>
                    {hasPermission(role, PermissionKey.VIEW_AI_LOGS) ? (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 text-xs">
                            {aiLogs.length > 0 ? aiLogs.map(log => (<div key={log.id} className="border-b pb-1"><p><strong>Task:</strong> {log.taskType}</p><p><strong>Status:</strong> {log.status}</p></div>)) : <p>No logs.</p>}
                        </div>
                    ) : <p>No permission to view logs.</p>}
                </div>
            </div>
        </div>
    );
};


export default SettingsPage;