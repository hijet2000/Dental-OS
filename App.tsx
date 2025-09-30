
import React, { useState, useEffect } from 'react';
import SettingsPage from './components/SettingsPage';
import KioskPage from './components/KioskPage';
import { NotificationProvider, useNotifications } from './components/Notification';
import { AppProvider } from './hooks/useApp';
import { BrandingProvider } from './hooks/useBranding';
import { complianceService } from './services/complianceService';
// Fix: Corrected import path
import { staffService } from './services/staffService';
// Fix: Corrected import path
import { notificationRuleEngineService } from './services/notificationRuleEngineService';

const BackgroundChecker: React.FC = () => {
    const { addNotification } = useNotifications();

    useEffect(() => {
        // Set up the listener for IN_APP notifications
        const unsubscribe = notificationRuleEngineService.subscribe(notification => {
            if (notification.channel === 'IN_APP') {
                addNotification({ type: 'info', message: notification.message });
            }
        });

        // Set up a timer to simulate background checks (e.g., cron job)
        const interval = setInterval(() => {
            console.log("Running background checks for notifications...");
            complianceService.checkAndTriggerOverdueNotifications();
            staffService.checkAndTriggerAnomalyNotifications();
        }, 30 * 1000); // Run every 30 seconds

        // Initial check on load
        complianceService.checkAndTriggerOverdueNotifications();
        staffService.checkAndTriggerAnomalyNotifications();

        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, [addNotification]);

    return null; // This component does not render anything
};

const App: React.FC = () => {
    const [isKioskMode, setIsKioskMode] = useState(false);

    return (
        <BrandingProvider>
            <NotificationProvider>
                <AppProvider>
                    <BackgroundChecker />
                    <div className="min-h-screen text-gray-800 bg-gray-50">
                        {isKioskMode ? (
                            <KioskPage onExit={() => setIsKioskMode(false)} />
                        ) : (
                            <SettingsPage onLaunchKiosk={() => setIsKioskMode(true)} />
                        )}
                    </div>
                </AppProvider>
            </NotificationProvider>
        </BrandingProvider>
    );
};

export default App;