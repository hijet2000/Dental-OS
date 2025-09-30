import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import BackupTab from './data/BackupTab';
import ImportTab from './data/ImportTab';
import ExportTab from './data/ExportTab';

type DataTab = 'backup' | 'import' | 'export';
    
const TabButton: FC<{ tabName: DataTab; label: string; activeTab: DataTab; setActiveTab: (tab: DataTab) => void }> = ({ tabName, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
    >
        {label}
    </button>
);

const DataManagementPage: FC = () => {
    const [activeTab, setActiveTab] = useState<DataTab>('backup');
    
    return (
        <SettingsPanel title="Data Management">
             <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <TabButton tabName="backup" label="Backup & Restore" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton tabName="import" label="Import from CSV" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton tabName="export" label="Export Data" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div>
                    {activeTab === 'backup' && <BackupTab />}
                    {activeTab === 'import' && <ImportTab />}
                    {activeTab === 'export' && <ExportTab />}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default DataManagementPage;
