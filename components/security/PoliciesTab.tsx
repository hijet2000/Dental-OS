import React, { useState, FC } from 'react';
import { useApp } from '../../hooks/useApp';
import { useNotifications } from '../Notification';
import { SecurityPolicies } from '../../types';
import { securityService } from '../../services/securityService';

const PoliciesTab: FC = () => {
    const { subscriptionPlan } = useApp();
    const { addNotification } = useNotifications();
    const [policies, setPolicies] = useState<SecurityPolicies>(securityService.getPolicies());

    const isEnterprise = subscriptionPlan === 'Enterprise';

    const handleToggle = (key: keyof SecurityPolicies) => {
        setPolicies(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'ipAllowlist') {
            setPolicies(prev => ({ ...prev, ipAllowlist: value.split('\n').filter(ip => ip.trim() !== '') }));
        } else {
            setPolicies(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        securityService.savePolicies(policies);
        addNotification({type: 'success', message: 'Security policies updated successfully.'});
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Access Control</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enforce Strong Passwords</p>
                            <p className="text-sm text-gray-500">Require a mix of letters, numbers, and symbols.</p>
                        </div>
                        <button onClick={() => handleToggle('enforceStrongPasswords')} className={`${policies.enforceStrongPasswords ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}>
                            <span className={`${policies.enforceStrongPasswords ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                        </button>
                    </div>
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enable Multi-Factor Authentication (MFA)</p>
                            <p className="text-sm text-gray-500">Users will need an authenticator app to log in.</p>
                        </div>
                        <button onClick={() => handleToggle('mfaEnabled')} className={`${policies.mfaEnabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}>
                            <span className={`${policies.mfaEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                        </button>
                    </div>
                    <div>
                        <label className="block font-medium">Session Timeout (minutes)</label>
                        <p className="text-sm text-gray-500 mb-1">Automatically log users out after a period of inactivity.</p>
                        <input type="number" name="sessionTimeoutMinutes" value={policies.sessionTimeoutMinutes} onChange={handleInputChange} className="w-full md:w-1/3 p-2 border rounded-md" />
                    </div>
                     <div className={`p-4 rounded-md ${!isEnterprise ? 'bg-gray-100' : ''}`}>
                         <label className="block font-medium">IP Allowlist { !isEnterprise && <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full ml-2">ENTERPRISE</span> }</label>
                        <p className="text-sm text-gray-500 mb-1">Restrict access to specific IP addresses. One per line.</p>
                        <textarea name="ipAllowlist" rows={4} value={policies.ipAllowlist.join('\n')} onChange={handleInputChange} disabled={!isEnterprise} className="w-full p-2 border rounded-md disabled:bg-gray-200" />
                    </div>
                </div>
            </div>
             <div className="flex justify-end">
                <button onClick={handleSave} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Save Policies</button>
            </div>
        </div>
    )
};

export default PoliciesTab;
