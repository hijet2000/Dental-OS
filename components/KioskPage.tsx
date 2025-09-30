
import React, { useState, FC, useEffect } from 'react';
// Fix: Corrected import path
import { staffService } from '../services/staffService';
import { useNotifications } from './Notification';
// Fix: Corrected import path
import { User, TimePunch } from '../types';
import { ClockIcon } from './icons';

interface KioskPageProps {
    onExit: () => void;
}

const KioskPage: FC<KioskPageProps> = ({ onExit }) => {
    const [pin, setPin] = useState('');
    const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
    const [userStatus, setUserStatus] = useState<'Clocked Out' | 'On Shift' | 'On Break'>('Clocked Out');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOffline, setIsOffline] = useState(false);
    const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

    const { addNotification } = useNotifications();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };
    
    const handleBackspace = () => setPin(pin.slice(0, -1));
    const handleClear = () => setPin('');
    
    const handleLogin = () => {
        const user = staffService.getUserByPin(pin);
        if (user) {
            setAuthenticatedUser(user);
            const status = staffService.getUserStatus(user.id);
            setUserStatus(status.status);
            addNotification({ type: 'success', message: `Welcome, ${user.name}!` });
            handleClear();
        } else {
            addNotification({ type: 'error', message: 'Invalid PIN.' });
            handleClear();
        }
    };
    
    const handleLogout = () => {
        setAuthenticatedUser(null);
        setUserStatus('Clocked Out');
    };

    const handlePunch = (type: TimePunch['type']) => {
        if (!authenticatedUser) return;
        
        if (isOffline) {
            const punch = { userId: authenticatedUser.id, type, isOffline: true };
            setOfflineQueue(prev => [...prev, punch]);
            addNotification({type: 'info', message: `Offline: Queued ${type} action.`});
            // Optimistically update UI
             const nextStatus = { 'clock-in': 'On Shift', 'clock-out': 'Clocked Out', 'break-start': 'On Break', 'break-end': 'On Shift' };
             setUserStatus(nextStatus[type] as any);
        } else {
            const result = staffService.addPunch(authenticatedUser.id, type, false);
            if(result.success) {
                const newStatus = staffService.getUserStatus(authenticatedUser.id);
                setUserStatus(newStatus.status);
                addNotification({type: 'success', message: result.message});
            } else {
                addNotification({type: 'error', message: result.message});
            }
        }
    };

    const syncOfflineQueue = () => {
        let successCount = 0;
        offlineQueue.forEach(p => {
            const result = staffService.addPunch(p.userId, p.type, true);
            if(result.success) successCount++;
        });
        setOfflineQueue([]);
        addNotification({type: 'success', message: `Synced ${successCount} offline punches.`});
        // Refresh status from source of truth after sync
        if (authenticatedUser) {
            setUserStatus(staffService.getUserStatus(authenticatedUser.id).status);
        }
    };

    const PinPad = () => (
        <div className="w-full max-w-xs mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold">Enter PIN</h2>
                <div className="h-10 mt-2 bg-white border rounded-md flex items-center justify-center text-2xl tracking-widest">
                    {pin.split('').map((_, i) => '*').join('')}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => 
                    <button key={d} onClick={() => handlePinInput(d.toString())} className="p-4 bg-white rounded-lg shadow text-xl font-bold hover:bg-gray-100">{d}</button>
                )}
                 <button onClick={handleClear} className="p-4 bg-yellow-400 rounded-lg shadow text-lg font-bold">C</button>
                 <button onClick={() => handlePinInput('0')} className="p-4 bg-white rounded-lg shadow text-xl font-bold">0</button>
                 <button onClick={handleBackspace} className="p-4 bg-red-500 text-white rounded-lg shadow text-lg font-bold">⌫</button>
            </div>
            <button onClick={handleLogin} className="w-full mt-4 p-4 bg-indigo-600 text-white rounded-lg shadow text-xl font-bold" disabled={pin.length !== 4}>Login</button>
        </div>
    );
    
    const ActionsPanel = () => {
        if (!authenticatedUser) return null;
        
        return (
            <div className="text-center">
                <img src={authenticatedUser.avatarUrl} alt={authenticatedUser.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg" />
                <h2 className="text-3xl font-bold">Welcome, {authenticatedUser.name.split(' ')[0]}</h2>
                <p className="text-lg text-gray-600 mt-1">Status: <span className="font-semibold text-indigo-800">{userStatus}</span></p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    {userStatus === 'Clocked Out' && <button onClick={() => handlePunch('clock-in')} className="p-6 bg-green-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-green-600">Clock In</button>}
                    {userStatus !== 'Clocked Out' && <button onClick={() => handlePunch('clock-out')} className="p-6 bg-red-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-red-600">Clock Out</button>}
                    {userStatus === 'On Shift' && <button onClick={() => handlePunch('break-start')} className="p-6 bg-yellow-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-yellow-600">Start Break</button>}
                    {userStatus === 'On Break' && <button onClick={() => handlePunch('break-end')} className="p-6 bg-blue-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-600">End Break</button>}
                </div>
                
                <button onClick={handleLogout} className="mt-8 text-gray-500 hover:text-gray-800">Logout</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col p-4 md:p-8">
            <header className="flex justify-between items-start">
                <div>
                     <h1 className="text-3xl font-bold text-indigo-600 flex items-center"><ClockIcon className="w-8 h-8 mr-2"/> Time Clock Kiosk</h1>
                     <p className="text-5xl font-light text-gray-800 mt-2">{currentTime.toLocaleTimeString()}</p>
                     <p className="text-xl text-gray-500">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={onExit} className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Exit Kiosk</button>
            </header>
            
            <main className="flex-1 flex items-center justify-center">
                {authenticatedUser ? <ActionsPanel /> : <PinPad />}
            </main>

            <footer className="text-center p-4">
                 <div className="flex items-center justify-center my-4">
                    <label htmlFor="offline-toggle" className="mr-2 text-sm font-medium text-gray-700">Simulate Offline Mode</label>
                    <input type="checkbox" id="offline-toggle" checked={isOffline} onChange={() => setIsOffline(!isOffline)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                     {offlineQueue.length > 0 && !isOffline && (
                        <button onClick={syncOfflineQueue} className="ml-4 text-sm bg-green-500 text-white px-3 py-1 rounded-md">Sync {offlineQueue.length} items</button>
                     )}
                </div>
            </footer>
        </div>
    );
};

export default KioskPage;