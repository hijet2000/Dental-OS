
import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import PoliciesTab from './security/PoliciesTab';
import AuditLogTab from './security/AuditLogTab';
import DataManagementTab from './security/DataManagementTab';

type SecurityTab = 'policies' | 'audit' | 'data';

const TabButton: FC<{ tabName: SecurityTab; label: string; activeTab: SecurityTab; setActiveTab: (tab: SecurityTab) => void; }> = ({ tabName, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
    >
        {label}
    </button>
);

const SecurityCompliancePage: FC = () => {
    const [activeTab, setActiveTab] = useState<SecurityTab>('policies');

    return (
        <SettingsPanel title="Security & Compliance">
            <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <TabButton tabName="policies" label="Policies" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton tabName="audit" label="Audit Log" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton tabName="data" label="Data Management" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div>
                    {activeTab === 'policies' && <PoliciesTab />}
                    {activeTab === 'audit' && <AuditLogTab />}
                    {activeTab === 'data' && <DataManagementTab />}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default SecurityCompliancePage;