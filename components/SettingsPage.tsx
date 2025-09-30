
import React, { useState, ReactNode, FC, Suspense } from 'react';
import { useApp } from '../hooks/useApp';
import { useBranding } from '../hooks/useBranding';
import { ClockIcon, ChatBubbleLeftRightIcon, Bars3Icon } from './icons';
import { AIAssistant } from './AIAssistant';
import { navigationConfig, pageComponentMap } from './navigation.config';
import LoadingSpinner from './LoadingSpinner';
import DashboardPage from './DashboardPage';

type Page = 'dashboard' | 'profile' | 'staff' | 'locations' | 'inventory' | 'appointments' | 'patients'
    | 'billing' | 'quality' | 'compliance' | 'tasks' | 'reports' | 'notifications' | 'branding'
    | 'security' | 'data' | 'nhs';

interface SettingsPageProps {
    onLaunchKiosk: () => void;
}

export const SettingsPanel: FC<{ title: string; children: ReactNode }> = ({ title, children }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
            <div className="mt-8">{children}</div>
        </div>
    );
};

const SettingsPage: FC<SettingsPageProps> = ({ onLaunchKiosk }) => {
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser } = useApp();
    const { branding } = useBranding();

    const renderPage = () => {
        const PageComponent = pageComponentMap.get(activePage);
        // Fallback to DashboardPage component if not found, though this shouldn't happen
        if (!PageComponent) {
            return <DashboardPage />;
        }
        return <PageComponent />;
    };

    const handleNavClick = (page: Page) => {
        setActivePage(page);
        setIsSidebarOpen(false); // Close sidebar on mobile after navigation
    }

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b flex items-center">
                <img src={branding.logoUrl} alt="Logo" className="h-10 w-10 mr-2" />
                <h1 className="text-xl font-bold">{branding.tenantName}</h1>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {navigationConfig.map((item, index) =>
                    'section' in item ? (
                        <h3 key={index} className="px-2 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.name}</h3>
                    ) : (
                        <button
                            key={item.name}
                            onClick={() => !item.disabled && handleNavClick(item.page as Page)}
                            disabled={item.disabled}
                            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-left ${
                                activePage === item.page
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <item.icon className="mr-3 h-6 w-6" />
                            {item.name}
                        </button>
                    )
                )}
            </nav>
            <div className="p-2 border-t">
                <button
                    onClick={() => setIsAssistantOpen(true)}
                    className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                    <ChatBubbleLeftRightIcon className="mr-3 h-6 w-6 text-purple-600" />
                    AI Assistant
                </button>
                <button
                    onClick={onLaunchKiosk}
                    className="mt-1 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                    <ClockIcon className="mr-3 h-6 w-6" />
                    Launch Kiosk
                </button>
            </div>
             <div className="p-4 border-t flex items-center">
                <img src={currentUser.avatarUrl} alt="User" className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
            </div>
        </>
    )

    return (
        <div className="flex h-screen bg-gray-100">
            <AIAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} currentPage={activePage} />
            
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-30`}>
                <SidebarContent />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                 {/* Top bar for mobile */}
                <header className="md:hidden bg-white border-b p-4 flex justify-between items-center">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Bars3Icon className="h-6 w-6 text-gray-600"/>
                    </button>
                    <h1 className="text-lg font-bold">{branding.tenantName}</h1>
                    <div className="w-6"></div> {/* Spacer */}
                </header>
                <main className="flex-1 overflow-y-auto bg-gray-50">
                     <Suspense fallback={<div className="p-8 w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
                        {renderPage()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;