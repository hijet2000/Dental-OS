import React, { useState, createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface NotificationContextType {
    addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const baseClasses = "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    const colorClasses = {
        success: "bg-green-50 text-green-800",
        error: "bg-red-50 text-red-800",
        info: "bg-blue-50 text-blue-800",
    };

    const icon = {
        success: <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        error: <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        info: <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };

    return (
        <div className={`${baseClasses} ${colorClasses[notification.type]}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">{icon[notification.type]}</div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(notification.id)} className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = uuidv4();
        setNotifications(prev => [...prev, { id, ...notification }]);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div
                aria-live="assertive"
                className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
            >
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {notifications.map(n => (
                        <Toast key={n.id} notification={n} onDismiss={dismissNotification} />
                    ))}
                </div>
            </div>
        </NotificationContext.Provider>
    );
};