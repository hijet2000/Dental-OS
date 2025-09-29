import React from 'react';
import SettingsPage from './components/SettingsPage';
import { NotificationProvider } from './components/Notification';

const App: React.FC = () => {
    return (
        <NotificationProvider>
            <div className="min-h-screen text-gray-800">
                <SettingsPage />
            </div>
        </NotificationProvider>
    );
};

export default App;