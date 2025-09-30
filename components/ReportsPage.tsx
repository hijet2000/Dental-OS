
import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { reportingService, KPIData } from '../services/reportingService';
import { useNotifications } from './Notification';

const KPI_METRICS: { key: keyof KPIData, label: string, unit: string, higherIsBetter: boolean }[] = [
    { key: 'appointmentsPerDay', label: 'Avg Appointments / Day', unit: '', higherIsBetter: true },
    { key: 'didNotAttendRate', label: 'Did Not Attend Rate', unit: '%', higherIsBetter: false },
    { key: 'chairUtilization', label: 'Chair Utilization', unit: '%', higherIsBetter: true },
    { key: 'avgLabTurnaround', label: 'Avg Lab Turnaround', unit: ' days', higherIsBetter: false },
    { key: 'labSlaCompliance', label: 'Lab SLA Compliance', unit: '%', higherIsBetter: true },
    { key: 'avgComplaintResolutionTime', label: 'Avg Complaint Resolution', unit: ' days', higherIsBetter: false },
];

const ReportsPage: FC = () => {
    const { addNotification } = useNotifications();
    const [kpiData, setKpiData] = useState<KPIData | null>(null);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const handleGenerateReport = () => {
        try {
            const data = reportingService.generateReport(new Date(startDate), new Date(endDate));
            setKpiData(data);
            addNotification({type: 'success', message: 'Report generated.'});
        } catch (error: any) {
            addNotification({type: 'error', message: `Failed to generate report: ${error.message}`})
        }
    };
    
    return (
        <SettingsPanel title="Performance Reports">
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Select Date Range</h3>
                <div className="flex items-center space-x-4">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md" />
                    <button onClick={handleGenerateReport} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Generate Report</button>
                </div>
            </div>

            {kpiData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {KPI_METRICS.map(({ key, label, unit, higherIsBetter }) => {
                        const value = kpiData[key];
                        // Dummy comparison for color
                        const isGood = higherIsBetter ? value > 50 : value < 10;
                        return (
                            <div key={key} className="bg-white p-4 rounded-lg shadow">
                                <p className="text-sm font-medium text-gray-500">{label}</p>
                                <p className={`text-3xl font-bold mt-1 ${isGood ? 'text-green-600' : 'text-red-600'}`}>{value}{unit}</p>
                            </div>
                        )
                    })}
                </div>
            )}
        </SettingsPanel>
    );
};

export default ReportsPage;
