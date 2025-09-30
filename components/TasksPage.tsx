import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { taskService } from '../services/taskService';
import { QRArea, TaskDef, TaskRun, Verification } from '../types';
import { useNotifications } from './Notification';
import QRCode from 'react-qr-code';

type TasksTab = 'runs' | 'definitions' | 'areas';

const TaskRunsList: FC = () => {
    const runs = useMemo(() => taskService.getTaskRuns(), []);
    const defs = useMemo(() => taskService.getTaskDefs(), []);
    const areas = useMemo(() => taskService.getQRAreas(), []);

    const getRunDetails = (run: TaskRun) => {
        const definition = defs.find(d => d.id === run.taskDefId);
        const area = areas.find(a => a.id === run.qrAreaId);
        return { definition, area };
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {runs.map(run => {
                        const { definition, area } = getRunDetails(run);
                        const verification = taskService.getVerificationForRun(run.id);
                        return (
                            <tr key={run.id}>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-900">{definition?.title}</p>
                                    <p className="text-sm text-gray-500">Area: {area?.name}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{run.performedAt.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm">
                                    {verification ? (
                                        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${verification.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Verified: {verification.status}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending Verification
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const TaskDefsList: FC = () => {
    const defs = useMemo(() => taskService.getTaskDefs(), []);
    return (
        <div className="space-y-4">
            {defs.map(def => (
                <div key={def.id} className="bg-white p-4 rounded-lg shadow border">
                    <h4 className="font-bold">{def.title}</h4>
                    <p className="text-sm text-gray-600">{def.description}</p>
                    <div className="mt-2 text-xs space-x-4">
                        <span>Frequency: <strong className="capitalize">{def.frequency}</strong></span>
                        <span>Performer: <strong>{def.performerRoleId}</strong></span>
                        <span>Verifier: <strong>{def.verifierRoleId}</strong></span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const QRAreasList: FC = () => {
    const areas = useMemo(() => taskService.getQRAreas(), []);

    const handlePrint = (areaName: string) => {
        const printContent = document.getElementById(`qr-print-${areaName}`)?.innerHTML;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
        if (printWindow) {
            printWindow.document.write(`<html><head><title>Print QR Code</title></head><body>${printContent}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map(area => (
                <div key={area.id} className="bg-white p-4 rounded-lg shadow border text-center">
                    <div id={`qr-print-${area.name}`}>
                        <h4 className="font-bold text-lg">{area.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{area.locationDescription}</p>
                        <div className="p-4 bg-white inline-block">
                             <QRCode value={area.qrCodeContent} size={128} />
                        </div>
                    </div>
                    <button onClick={() => handlePrint(area.name)} className="mt-4 w-full text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
                        Print QR Code
                    </button>
                </div>
            ))}
        </div>
    );
};


const TasksPage: FC = () => {
    const [activeTab, setActiveTab] = useState<TasksTab>('runs');

    const TabButton: FC<{ tabName: TasksTab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
        >
            {label}
        </button>
    );

    return (
        <SettingsPanel title="Task Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2 border-b">
                        <TabButton tabName="runs" label="Task Runs" />
                        <TabButton tabName="definitions" label="Task Definitions" />
                        <TabButton tabName="areas" label="QR Areas" />
                    </div>
                </div>
                <div className="mt-4">
                    {activeTab === 'runs' && <TaskRunsList />}
                    {activeTab === 'definitions' && <TaskDefsList />}
                    {activeTab === 'areas' && <QRAreasList />}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default TasksPage;
