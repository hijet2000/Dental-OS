import React, { useState, FC, useMemo } from 'react';
import { useNotifications } from '../Notification';
import { Backup } from '../../types';
import { backupService } from '../../services/backupService';

const BackupTab: FC = () => {
    const { addNotification } = useNotifications();
    const backups = useMemo(() => backupService.getBackups(), []);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    const handleRestore = async (backup: Backup) => {
        if (window.confirm(`Are you sure you want to restore from the backup created on ${backup.timestamp.toLocaleString()}? This action cannot be undone.`)) {
            setRestoringId(backup.id);
            const message = await backupService.restoreFromBackup(backup.id);
            addNotification({ type: 'success', message });
            setRestoringId(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-1">System Backups</h3>
            <p className="text-sm text-gray-500 mb-4">Daily backups of your clinic's data are created automatically.</p>
            <ul className="divide-y divide-gray-200 border rounded-md">
                {backups.map(backup => (
                    <li key={backup.id} className="p-3 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{backup.fileName}</p>
                            <p className="text-sm text-gray-500">Created: {backup.timestamp.toLocaleString()} ({(backup.sizeBytes / 1024).toFixed(1)} KB)</p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => backupService.downloadBackup(backup.fileName)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md">Download</button>
                            <button onClick={() => handleRestore(backup)} disabled={restoringId === backup.id} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md disabled:bg-red-300">
                                {restoringId === backup.id ? 'Restoring...' : 'Restore'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BackupTab;
