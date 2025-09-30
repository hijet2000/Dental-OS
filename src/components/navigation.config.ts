// FIX: Changed component type from FC<{}> to ComponentType<any> to match React.lazy's return type, and imported ComponentType. This resolves type mismatch errors when using React.lazy with functional components.
import React, { lazy, LazyExoticComponent, FC, ComponentType } from 'react';
import {
    BuildingOfficeIcon, BellIcon, WrenchScrewdriverIcon, QrCodeIcon, ClockIcon,
    IdentificationIcon, BeakerIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon,
    CreditCardIcon, UserCircleIcon, SparklesIcon,
    ClipboardDocumentCheckIcon
} from './icons';

// Lazy load all page components for code splitting
const DashboardPage = lazy(() => import('./DashboardPage'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const StaffPage = lazy(() => import('./StaffPage'));
const LocationsPage = lazy(() => import('./LocationsPage'));
const InventoryPage = lazy(() => import('./InventoryPage'));
const BillingPage = lazy(() => import('./BillingPage'));
const QualityPage = lazy(() => import('./QualityPage'));
const CompliancePage = lazy(() => import('./CompliancePage'));
const TasksPage = lazy(() => import('./TasksPage'));
const ReportsPage = lazy(() => import('./ReportsPage'));
const NotificationsPage = lazy(() => import('./NotificationsPage'));
const BrandingPage = lazy(() => import('./BrandingPage'));
const SecurityCompliancePage = lazy(() => import('./SecurityCompliancePage'));

export interface NavItem {
    name: string;
    page: string;
    icon: React.FC<{ className?: string }>;
    component: LazyExoticComponent<ComponentType<any>>;
    disabled?: boolean;
}

export interface NavSection {
    name: string;
    section: true;
}

export type NavigationItem = NavItem | NavSection;

export const navigationConfig: NavigationItem[] = [
    { name: 'Dashboard', page: 'dashboard', icon: UserCircleIcon, component: DashboardPage },
    { name: 'My Profile', page: 'profile', icon: UserCircleIcon, component: ProfilePage },
    { name: 'Staff', page: 'staff', icon: IdentificationIcon, component: StaffPage },
    { name: 'Rota', page: 'dashboard', icon: ClockIcon, component: DashboardPage, disabled: true }, // Placeholder
    { name: 'Practice', section: true },
    { name: 'Locations', page: 'locations', icon: BuildingOfficeIcon, component: LocationsPage },
    { name: 'Inventory', page: 'inventory', icon: WrenchScrewdriverIcon, component: InventoryPage },
    { name: 'Tasks (QR)', page: 'tasks', icon: QrCodeIcon, component: TasksPage },
    { name: 'Reports', page: 'reports', icon: ClipboardDocumentListIcon, component: ReportsPage },
    { name: 'Quality', section: true },
    { name: 'Lab Cases', page: 'quality', icon: BeakerIcon, component: QualityPage },
    { name: 'Complaints', page: 'quality', icon: ExclamationTriangleIcon, component: QualityPage },
    { name: 'Compliance', page: 'compliance', icon: ClipboardDocumentCheckIcon, component: CompliancePage },
    { name: 'Billing', section: true },
    { name: 'Subscription', page: 'billing', icon: CreditCardIcon, component: BillingPage },
    { name: 'Admin', section: true },
    { name: 'Notifications', page: 'notifications', icon: BellIcon, component: NotificationsPage },
    { name: 'Branding', page: 'branding', icon: SparklesIcon, component: BrandingPage },
    { name: 'Security', page: 'security', icon: ExclamationTriangleIcon, component: SecurityCompliancePage },
];

export const pageComponentMap = new Map<string, LazyExoticComponent<ComponentType<any>>>(
    navigationConfig
        .filter((item): item is NavItem => 'component' in item)
        .map(item => [item.page, item.component])
);