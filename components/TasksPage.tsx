

import React, { useState, FC, useEffect } from 'react';
import { SettingsPanel } from './SettingsPage';
import { taskService } from '../services/taskService';
import { staffService } from '../services/staffService';
import { QRArea, TaskDef, TaskRun, User } from '../types';

// Sub-component for Task Definitions Tab
const TaskDefinitionsTab: FC = () => {
    const [taskDefs] = useState(() => taskService.getTaskDefs());

    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Definitions</h3>
            <p className="text-sm text-gray-500 mb-4">Define recurring tasks that can be performed and verified by staff.</p>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performer Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verifier Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA (Mins)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {taskDefs.map(def => (
                            <tr key={def.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{def.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{def.frequency}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{def.performerRoleId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{def.verifierRoleId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{def.slaMinutes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Sub-component for QR Areas Tab
const QRAreasTab: FC = () => {
    const [qrAreas] = useState(() => taskService.getQRAreas());
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Areas</h3>
            <p className="text-sm text-gray-500 mb-4">Assign QR codes to physical locations to allow staff to quickly log tasks.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrAreas.map(area => (
                    <div key={area.id} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-bold">{area.name}</p>
                        <p className="text-sm text-gray-600">{area.locationDescription}</p>
                        <div className="mt-2 bg-gray-100 p-2 rounded">
                            <p className="text-xs text-gray-500">QR Code Content:</p>
                            <p className="text-sm font-mono break-all">{area.qrCodeContent}</p>
                            {/* In a real app with a QR library, you would render the QR code here */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component for Task History Tab
const TaskHistoryTab: FC = () => {
    const [taskRuns] = useState(() => taskService.getTaskRuns());
    const [taskDefs] = useState(() => taskService.getTaskDefs());
    // FIX: Fetch users asynchronously
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const fetchedUsers = await staffService.getUsers();
            setUsers(fetchedUsers);
        };
        fetchUsers();
    }, []);

    const getTaskName = (defId: string) => taskDefs.find(d => d.id === defId)?.title || 'Unknown Task';
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Run History</h3>
             <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                       {taskRuns.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No task runs have been recorded yet.</td>
                            </tr>
                        ) : (
                            taskRuns.map(run => (
                                <tr key={run.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getTaskName(run.taskDefId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{run.performedAt.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUserName(run.performerId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {run.verificationId ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Verification</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                       )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Main Component
type TaskTab = 'definitions' | 'areas' | 'history';

const TasksPage: FC = () => {
    const [activeTab, setActiveTab] = useState<TaskTab>('definitions');

    const TabButton: FC<{ tabName: TaskTab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
        >
            {label}
        </button>
    );

    return (
        <SettingsPanel title="Tasks & QR Management">
             <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <TabButton tabName="definitions" label="Task Definitions" />
                    <TabButton tabName="areas" label="QR Code Areas" />
                    <TabButton tabName="history" label="Task History" />
                </div>
                <div>
                    {activeTab === 'definitions' && <TaskDefinitionsTab />}
                    {activeTab === 'areas' && <QRAreasTab />}
                    {activeTab === 'history' && <TaskHistoryTab />}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default TasksPage;
