
import React, { useState, FC, ReactNode } from 'react';
import { useApp } from '../hooks/useApp';
import { useBranding } from '../hooks/useBranding';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
// Fix: Corrected import path
import StaffPage from './StaffPage';
import InventoryPage from './InventoryPage';
import AppointmentsPage from './AppointmentsPage';
import PatientsPage from './PatientsPage';
import PatientBillingPage from './PatientBillingPage';
import NhsManagementPage from './NhsManagementPage';
import QualityPage from './QualityPage';
import CompliancePage from './CompliancePage';
import ReportsPage from './ReportsPage';
import TasksPage from './TasksPage';
// Fix: Corrected import path
import NotificationsPage from './NotificationsPage';
import BillingPage from './BillingPage';
import PlanCatalogPage from './PlanCatalogPage';
// Fix: Corrected import path
import LocationsPage from './LocationsPage';
import SecurityCompliancePage from './SecurityCompliancePage';
import DataManagementPage from './DataManagementPage';
import BrandingPage from './BrandingPage';
// Fix: Corrected import path
import { rbacService } from '../services/rbacService';
import { BuildingOfficeIcon, UserCircleIcon, IdentificationIcon, WrenchScrewdriverIcon, ClockIcon, ClipboardDocumentListIcon, BanknotesIcon, NhsIcon, BeakerIcon, ExclamationTriangleIcon, ClipboardDocumentCheckIcon, SparklesIcon, BellIcon, CreditCardIcon, QrCodeIcon } from './icons';

interface SettingsPageProps {
  onLaunchKiosk: () => void;
}

export const SettingsPanel: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
        <div>{children}</div>
    </div>
);

const SettingsPage: FC<SettingsPageProps> = ({ onLaunchKiosk }) => {
    const { currentUser, users, subscriptionPlan } = useApp();
    const { branding } = useBranding();
    const [activePage, setActivePage] = useState('dashboard');

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', component: <DashboardPage />, requiredPermission: 'dashboard:read', icon: SparklesIcon },
        { id: 'profile', label: 'My Profile', component: <ProfilePage />, requiredPermission: 'profile:read', icon: UserCircleIcon },
        { id: 'staff', label: 'Staff & Rota', component: <StaffPage />, requiredPermission: 'users:read', icon: IdentificationIcon },
        { id: 'inventory', label: 'Inventory', component: <InventoryPage />, requiredPermission: 'inventory:read', icon: WrenchScrewdriverIcon },
        { id: 'appointments', label: 'Appointments', component: <AppointmentsPage />, requiredPermission: 'appointments:read', icon: ClockIcon },
        { id: 'patients', label: 'Clinical', component: <PatientsPage />, requiredPermission: 'patients:read', icon: ClipboardDocumentListIcon },
        { id: 'patient-billing', label: 'Patient Billing', component: <PatientBillingPage />, requiredPermission: 'billing:read', plan: 'Pro', icon: BanknotesIcon },
        { id: 'nhs', label: 'NHS Management', component: <NhsManagementPage />, requiredPermission: 'nhs:read', plan: 'Enterprise', icon: NhsIcon },
        { id: 'quality', label: 'Quality', component: <QualityPage />, requiredPermission: 'quality:read', plan: 'Pro', icon: BeakerIcon },
        { id: 'compliance', label: 'Compliance', component: <CompliancePage />, requiredPermission: 'compliance:read', plan: 'Pro', icon: ExclamationTriangleIcon },
        { id: 'tasks', label: 'Tasks', component: <TasksPage />, requiredPermission: 'tasks:read', icon: ClipboardDocumentCheckIcon },
        { id: 'reports', label: 'Reports', component: <ReportsPage />, requiredPermission: 'reports:read', plan: 'Pro', icon: SparklesIcon },
        { id: 'notifications', label: 'Notifications', component: <NotificationsPage />, requiredPermission: 'notifications:configure', icon: BellIcon },
        { id: 'billing', label: 'Billing', component: <BillingPage />, requiredPermission: 'tenant:billing', icon: CreditCardIcon },
        { id: 'plan-catalog', label: 'Plan Catalog', component: <PlanCatalogPage />, requiredPermission: 'tenant:billing', icon: SparklesIcon },
        { id: 'locations', label: 'Practice & Locations', component: <LocationsPage />, requiredPermission: 'practice:locations:read', icon: BuildingOfficeIcon },
        { id: 'security', label: 'Security', component: <SecurityCompliancePage />, requiredPermission: 'security:read', icon: SparklesIcon },
        { id: 'data', label: 'Data', component: <DataManagementPage />, requiredPermission: 'data:manage', plan: 'Enterprise', icon: SparklesIcon },
        { id: 'branding', label: 'Branding', component: <BrandingPage />, requiredPermission: 'tenant:customize', plan: 'Pro', icon: SparklesIcon },
    ].filter(item => {
        const hasPermission = rbacService.can(currentUser.role, item.requiredPermission as any);
        if (!item.plan) return hasPermission;
        if (subscriptionPlan === 'Enterprise') return hasPermission;
        if (subscriptionPlan === 'Pro' && (item.plan === 'Pro' || item.plan === 'Basic')) return hasPermission;
        if (subscriptionPlan === 'Basic' && item.plan === 'Basic') return hasPermission;
        return false;
    });

    const ActiveComponent = navItems.find(item => item.id === activePage)?.component || <DashboardPage />;

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="h-16 flex items-center justify-center border-b px-4">
                    <img src={branding.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                    <span className="ml-2 font-bold text-lg truncate">{branding.tenantName}</span>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActivePage(item.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${activePage === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button onClick={onLaunchKiosk} className="w-full text-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                        Launch Kiosk
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {ActiveComponent}
            </main>
        </div>
    );
};

export default SettingsPage;