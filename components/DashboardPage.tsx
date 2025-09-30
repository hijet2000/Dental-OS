import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useApp } from '../hooks/useApp';
import { appointmentService } from '../services/appointmentService';
import { rotaService } from '../services/rotaService';
import { inventoryService } from '../services/inventoryService';
import { complianceService } from '../services/complianceService';
import { qualityService } from '../services/qualityService';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { useNotifications } from './Notification';
import { BellIcon, SparklesIcon, ArrowPathIcon, ExclamationTriangleIcon } from './icons';

const AdminDashboard: FC = () => {
    const [briefing, setBriefing] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const appointmentsToday = appointmentService.getAppointmentsForDate(new Date());
    const onDuty = rotaService.getShiftsForWeek(today).filter(s => new Date() >= s.start && new Date() <= s.end);
    const lowStock = inventoryService.getLowStockItems();
    const overdueCompliance = complianceService.getDocuments().filter(d => d.status === 'Overdue');
    const labsDue = qualityService.getLabsDueSoon();
    const openComplaints = qualityService.getOpenComplaints();

    const generateBriefing = async () => {
        setLoading(true);
        try {
            const result = await aiOrchestrationService.runTask('DAILY_BRIEF', {
                appointments: appointmentsToday,
                onDuty: onDuty.map(s => s.staffId),
                lowStock,
                overdueCompliance,
                labsDue,
                openComplaints,
            });
            setBriefing(result);
        } catch (error: any) {
            addNotification({type: 'error', message: `Briefing failed: ${error.message}`});
        } finally {
            setLoading(false);
        }
    };

    const StatCard: FC<{ title: string; value: number | string; alert?: boolean }> = ({ title, value, alert }) => (
        <div className={`p-4 rounded-lg ${alert ? 'bg-red-50 border-red-200 border' : 'bg-white shadow'}`}>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-3xl font-bold ${alert ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
        </div>
    );

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Appointments" value={appointmentsToday.length} />
                <StatCard title="Staff On Duty" value={onDuty.length} />
                <StatCard title="Low Stock" value={lowStock.length} alert={lowStock.length > 0} />
                <StatCard title="Overdue Compliance" value={overdueCompliance.length} alert={overdueCompliance.length > 0} />
                <StatCard title="Labs Due" value={labsDue.length} alert={labsDue.length > 0} />
                <StatCard title="Open Complaints" value={openComplaints.length} alert={openComplaints.length > 0} />
            </div>
            <div className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold flex items-center">AI Daily Briefing</h3>
                     <button onClick={generateBriefing} disabled={loading} className="mt-2 w-full md:w-auto text-sm bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center">
                        {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                        {loading ? 'Generating...' : 'Generate Today\'s Briefing'}
                    </button>
                    {briefing && (
                         <div className="mt-4 p-4 bg-purple-50 rounded-lg text-sm space-y-3">
                             <h4 className="font-bold text-purple-800">Summary</h4>
                             <p className="text-purple-700">{briefing.summary}</p>
                             <h4 className="font-bold text-purple-800">Top Priorities</h4>
                             <ul className="list-disc list-inside text-purple-700">
                                 {briefing.priorities.map((p: string, i:number) => <li key={i}>{p}</li>)}
                             </ul>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const StaffDashboard: FC = () => {
    const { currentUser } = useApp();
    const today = new Date();
    today.setHours(0,0,0,0);

    const appointmentsToday = appointmentService.getAppointmentsForDate(new Date());
    const myAppointments = appointmentsToday.filter(a => a.staffId === currentUser.id);

    const myShift = rotaService.getShiftsForWeek(today).find(s => s.staffId === currentUser.id && s.start.toDateString() === today.toDateString());

    return (
         <div>
            <h3 className="text-xl font-semibold mb-4">Your Day at a Glance, {currentUser.name.split(' ')[0]}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">My Next Patients</h4>
                     {myAppointments.length > 0 ? (
                        <ul className="space-y-2">
                         {myAppointments.map(app => (
                            <li key={app.id} className="text-sm p-2 bg-gray-50 rounded-md">
                                {app.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Patient ID {app.patientId.slice(0,4)} ({app.type})
                            </li>
                         ))}
                        </ul>
                     ) : <p className="text-sm text-gray-500">No patients on your schedule today.</p>}
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">My Shift</h4>
                     {myShift ? (
                        <p className="text-lg">
                            {myShift.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {myShift.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     ) : <p className="text-sm text-gray-500">You are not scheduled to work today.</p>}
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                    <h4 className="font-semibold mb-2">My Compliance Tasks</h4>
                     <p className="text-sm text-gray-500">QR task functionality coming soon.</p>
                 </div>
             </div>
        </div>
    );
}

const DashboardPage: React.FC = () => {
    const { currentUser } = useApp();
    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';

    return (
        <SettingsPanel title={isAdmin ? "Practice Dashboard" : "My Dashboard"}>
            {isAdmin ? <AdminDashboard /> : <StaffDashboard />}
        </SettingsPanel>
    );
};

export default DashboardPage;