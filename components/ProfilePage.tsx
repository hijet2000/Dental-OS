import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';

const ProfilePage: FC = () => {
    const { currentUser, updateUserProfile } = useApp();
    const { addNotification } = useNotifications();

    const [formData, setFormData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        password: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserProfile(currentUser.id, { name: formData.name, email: formData.email });
        addNotification({ type: 'success', message: 'Profile updated successfully.' });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            addNotification({ type: 'error', message: 'Password must be at least 8 characters long.' });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            addNotification({ type: 'error', message: 'Passwords do not match.' });
            return;
        }
        // In a real app, this would call an API endpoint.
        addNotification({ type: 'success', message: 'Password changed successfully.' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    };

    return (
        <SettingsPanel title="My Profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Info Card */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
                        <h2 className="text-xl font-bold">{currentUser.name}</h2>
                        <p className="text-gray-500">{currentUser.email}</p>
                        <span className="mt-2 inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">{currentUser.role}</span>
                    </div>
                </div>

                {/* Forms */}
                <div className="md:col-span-2 space-y-8">
                    {/* Update Profile Form */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    placeholder="8+ characters required"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SettingsPanel>
    );
};

export default ProfilePage;