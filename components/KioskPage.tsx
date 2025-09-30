
import React, { useState, FC, useEffect } from 'react';
import { staffService } from '../services/staffService';
import { User } from '../types';
import { useNotifications } from './Notification';
import { ClockIcon } from './icons';

interface KioskPageProps {
    onExit: () => void;
}

const KioskPage: FC<KioskPageProps> = ({ onExit }) => {
    const { addNotification } = useNotifications();
    const [time, setTime] = useState(new Date());
    const [pin, setPin] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleLogin = async () => {
        // FIX: Await async call to staffService
        const user = await staffService.getUserByPin(pin);
        if (user) {
            setCurrentUser(user);
        } else {
            addNotification({ type: 'error', message: 'Invalid PIN.' });
            setPin('');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setPin('');
    };

    const handlePunch = async (type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end') => {
        if (!currentUser) return;
        // FIX: Await async call to staffService
        const result = await staffService.addPunch(currentUser.id, type, false);
        addNotification({ type: result.success ? 'success' : 'error', message: result.message });
        if (result.success) {
            handleLogout();
        }
    };

    const renderLoginScreen = () => (
        <div className="w-full max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-center">Enter PIN</h2>
            <div className="my-6 h-12 flex justify-center items-center space-x-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 ${pin.length > i ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}></div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                    <button key={i + 1} onClick={() => handlePinInput(String(i + 1))} className="text-3xl p-4 bg-white rounded-lg shadow hover:bg-gray-100">{i + 1}</button>
                ))}
                <button onClick={handleBackspace} className="text-3xl p-4 bg-white rounded-lg shadow hover:bg-gray-100">⌫</button>
                <button onClick={() => handlePinInput('0')} className="text-3xl p-4 bg-white rounded-lg shadow hover:bg-gray-100">0</button>
                <button onClick={handleLogin} className="text-3xl p-4 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">✓</button>
            </div>
        </div>
    );

    const renderActionScreen = () => {
        if (!currentUser) return null;
        const userStatusInfo = staffService.getUserStatus(currentUser.id);

        return (
            <div className="w-full max-w-md mx-auto text-center">
                <img src={currentUser.avatarUrl} alt="User" className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Welcome, {currentUser.name.split(' ')[0]}</h2>
                <p className="text-lg text-gray-600">Current Status: <span className="font-semibold">{userStatusInfo.status}</span></p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {userStatusInfo.status === 'Clocked Out' && <button onClick={() => handlePunch('clock-in')} className="p-6 bg-green-500 text-white rounded-lg text-xl shadow">Clock In</button>}
                    {userStatusInfo.status === 'On Shift' && <button onClick={() => handlePunch('clock-out')} className="p-6 bg-red-500 text-white rounded-lg text-xl shadow">Clock Out</button>}
                    {userStatusInfo.status === 'On Shift' && <button onClick={() => handlePunch('break-start')} className="p-6 bg-yellow-500 text-white rounded-lg text-xl shadow">Start Break</button>}
                    {userStatusInfo.status === 'On Break' && <button onClick={() => handlePunch('break-end')} className="p-6 bg-blue-500 text-white rounded-lg text-xl shadow">End Break</button>}
                </div>
                <button onClick={handleLogout} className="mt-8 text-gray-600 hover:underline">Not you? Log out</button>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col p-6">
            <header className="flex justify-between items-center">
                <div className="flex items-center text-xl font-bold">
                    <ClockIcon className="w-8 h-8 mr-2" />
                    <span>Clock In/Out Kiosk</span>
                </div>
                <button onClick={onExit} className="text-sm bg-white px-4 py-2 rounded-lg shadow">Exit Kiosk</button>
            </header>
            <main className="flex-1 flex items-center justify-center">
                {currentUser ? renderActionScreen() : renderLoginScreen()}
            </main>
            <footer className="text-center text-gray-500">
                <p>{time.toLocaleTimeString()} - {time.toLocaleDateString()}</p>
            </footer>
        </div>
    );
};

export default KioskPage;
