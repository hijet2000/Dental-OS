import React, { FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { notificationRuleEngineService } from '../services/notificationRuleEngineService';

const NotificationsPage: FC = () => {
    const rules = useMemo(() => notificationRuleEngineService.getRules(), []);

    return (
        <SettingsPanel title="Notification Rules">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {rules.map((rule, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.event}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.channel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.recipientRole || rule.recipient}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{rule.template}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <p className="mt-4 text-sm text-gray-600">This page is for demonstration purposes. Rule editing is not yet implemented.</p>
        </SettingsPanel>
    );
};

export default NotificationsPage;