import React, { useState, FC, useEffect } from 'react';
import { SettingsPanel } from './SettingsPage';
import { staffService } from '../services/staffService';
import { User, UserRole } from '../types';
import { useNotifications } from './Notification';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { SparklesIcon, ArrowPathIcon } from './icons';
import { entitlementService } from '../services/entitlementService';
import { useApp } from '../hooks/useApp';
import LoadingSpinner from './LoadingSpinner';

const StaffPage: FC = () => {
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();
    const [staff, setStaff] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

    const canSuggestRole = entitlementService.has(currentUser, 'ai:suggest-role');
    const availableRoles: UserRole[] = ['Admin', 'Manager', 'Dentist', 'Hygienist', 'Receptionist', 'ComplianceLead'];

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const users = await staffService.getUsers();
                setStaff(users);
            } catch (error) {
                addNotification({ type: 'error', message: 'Failed to load staff data.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaff();
    }, [addNotification]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        await staffService.updateUserRole(userId, newRole);
        // Refetch data to ensure consistency
        const users = await staffService.getUsers();
        setStaff(users);
        addNotification({ type: 'success', message: 'User role updated.' });
    };

    const handleSuggestRole = async (user: User) => {
        setLoadingSuggestion(user.id);
        try {
            const result = await aiOrchestrationService.runTask<{ suggestedRole: UserRole, justification: string }, 'SUGGEST_ROLE'>('SUGGEST_ROLE', {
                userName: user.name,
                currentRole: user.role,
                availableRoles
            });
            addNotification({ type: 'info', message: `AI Suggestion for ${user.name}: Role of ${result.suggestedRole}. Justification: ${result.justification}` });
        } catch (error: any) {
            addNotification({ type: 'error', message: `AI failed: ${error.message}` });
        } finally {
            setLoadingSuggestion(null);
        }
    };

    if (isLoading) {
        return (
            <SettingsPanel title="Staff Management">
                <LoadingSpinner />
            </SettingsPanel>
        );
    }

    return (
        <SettingsPanel title="Staff Management">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staff.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                    <img className="h-10 w-10 rounded-full mr-4" src={user.avatarUrl} alt="" />
                                    <div>
                                        <div>{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value as UserRole)} className="p-1 border rounded-md">
                                        {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {canSuggestRole && (
                                        <button onClick={() => handleSuggestRole(user)} disabled={loadingSuggestion === user.id} className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs">
                                            {loadingSuggestion === user.id ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-1"/> : <SparklesIcon className="w-4 h-4 mr-1"/>}
                                            AI Suggest Role
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SettingsPanel>
    );
};

export default StaffPage;