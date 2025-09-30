
import React, { useState, useEffect, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { inventoryService } from '../services/inventoryService';
import { complianceService } from '../services/complianceService';
import { qualityService } from '../services/qualityService';
import { appointmentService } from '../services/appointmentService';
import { staffService } from '../services/staffService';
import { SparklesIcon, ArrowPathIcon } from './icons';
import { DailyBriefPayload, LiveUserStatus, StockItem, ComplianceDocument, LabCase, Complaint, Appointment } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface DailyBrief {
    summary: string;
    priorities: string[];
}

// FIX: Refactor component to handle asynchronous data fetching
const DashboardPage: FC = () => {
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();
    const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
    const [loadingBrief, setLoadingBrief] = useState(false);
    const [dashboardData, setDashboardData] = useState<{
        appointmentsToday: Appointment[];
        onDuty: LiveUserStatus[];
        lowStock: StockItem[];
        overdueCompliance: ComplianceDocument[];
        labsDue: LabCase[];
        openComplaints: Complaint[];
    } | null>(null);

    const generateBriefing = async () => {
        if (!dashboardData) {
            addNotification({ type: 'info', message: 'Dashboard data is still loading.' });
            return;
        }
        setLoadingBrief(true);
        try {
            const payload: DailyBriefPayload = {
                appointments: dashboardData.appointmentsToday,
                onDuty: dashboardData.onDuty,
                lowStock: dashboardData.lowStock,
                overdueCompliance: dashboardData.overdueCompliance,
                labsDue: dashboardData.labsDue,
                openComplaints: dashboardData.openComplaints,
            };
            // FIX: Provide both generic type arguments to runTask.
            const result = await aiOrchestrationService.runTask<DailyBrief, 'DAILY_BRIEF'>('DAILY_BRIEF', payload);
            setDailyBrief(result);
        } catch (error: any) {
            addNotification({ type: 'error', message: `Failed to generate briefing: ${error.message}` });
        } finally {
            setLoadingBrief(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [onDutyData, labsDueData, openComplaintsData] = await Promise.all([
                    staffService.getLiveStatuses(),
                    qualityService.getLabsDueSoon(7),
                    qualityService.getOpenComplaints(),
                ]);

                const appointmentsTodayData = appointmentService.getAppointmentsForDate(new Date());
                const lowStockData = inventoryService.getLowStockItems();
                const overdueComplianceData = complianceService.getDocuments().filter(doc => doc.status === 'Overdue');
                
                setDashboardData({
                    appointmentsToday: appointmentsTodayData,
                    onDuty: onDutyData.filter(s => s.status.status === 'On Shift' || s.status.status === 'On Break'),
                    lowStock: lowStockData,
                    overdueCompliance: overdueComplianceData,
                    labsDue: labsDueData,
                    openComplaints: openComplaintsData,
                });
            } catch (error) {
                addNotification({ type: 'error', message: 'Failed to load dashboard data.' });
            }
        };

        fetchData();
    }, [addNotification]);
    
    useEffect(() => {
        // Automatically generate briefing on load for relevant roles once data is available
        if (dashboardData && (currentUser.role === 'Admin' || currentUser.role === 'Manager')) {
            generateBriefing();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.role, dashboardData]);

    if (!dashboardData) {
        return (
            <SettingsPanel title={`Welcome back, ${currentUser.name.split(' ')[0]}!`}>
                <LoadingSpinner />
            </SettingsPanel>
        );
    }

    return (
        <SettingsPanel title={`Welcome back, ${currentUser.name.split(' ')[0]}!`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Daily Briefing */}
                    {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-purple-500" /> Your Daily Briefing</h3>
                                <button onClick={generateBriefing} disabled={loadingBrief} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-md hover:bg-purple-200 disabled:opacity-50">
                                    {loadingBrief ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : 'Refresh'}
                                </button>
                            </div>
                            {loadingBrief && <p className="mt-2 text-sm text-gray-500">Generating your briefing...</p>}
                            {dailyBrief && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-gray-700">{dailyBrief.summary}</p>
                                    <div>
                                        <h4 className="font-semibold">Top Priorities:</h4>
                                        <ul className="list-disc list-inside text-gray-600 text-sm mt-1 space-y-1">
                                            {dailyBrief.priorities.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Placeholder for more dashboard widgets */}
                     <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Today's Appointments ({dashboardData.appointmentsToday.length})</h3>
                        {/* A real implementation would have a list or mini calendar here */}
                        <p className="text-sm text-gray-500 mt-2">Appointment list component coming soon.</p>
                    </div>

                </div>

                {/* Side Panel with Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-semibold">At a Glance</h4>
                        <ul className="mt-2 space-y-2 text-sm">
                            <li className="flex justify-between"><span>Staff on Duty</span> <strong>{dashboardData.onDuty.length}</strong></li>
                            <li className="flex justify-between"><span>Appointments Today</span> <strong>{dashboardData.appointmentsToday.length}</strong></li>
                            <li className="flex justify-between text-red-600"><span>Low Stock Items</span> <strong>{dashboardData.lowStock.length}</strong></li>
                            <li className="flex justify-between text-red-600"><span>Overdue Compliance</span> <strong>{dashboardData.overdueCompliance.length}</strong></li>
                            <li className="flex justify-between text-yellow-600"><span>Labs Due Soon</span> <strong>{dashboardData.labsDue.length}</strong></li>
                            <li className="flex justify-between text-yellow-600"><span>Open Complaints</span> <strong>{dashboardData.openComplaints.length}</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </SettingsPanel>
    );
};

export default DashboardPage;
