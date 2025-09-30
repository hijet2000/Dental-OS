

// Fix: Corrected import path
import { Backup } from '../types';
// Fix: Corrected import path
import * as allData from '../constants'; // Import all mock data

export const backupService = {
    /**
     * Generates a list of simulated daily backups for the last 7 days.
     */
    getBackups: (): Backup[] => {
        const backups: Backup[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            backups.push({
                id: `backup-${date.getTime()}`,
                timestamp: date,
                fileName: `backup_${date.toISOString().split('T')[0]}.json`,
                sizeBytes: 123456 + Math.floor(Math.random() * 10000), // Randomize size a bit
            });
        }
        return backups;
    },

    /**
     * Creates a downloadable JSON file containing all mock data.
     * In a real app, this would fetch all current data from the live services.
     */
    downloadBackup: (fileName: string): void => {
        const dataToBackup = {
            MOCK_USERS: allData.MOCK_USERS,
            MOCK_STOCK_ITEMS: allData.MOCK_STOCK_ITEMS,
            MOCK_EQUIPMENT: allData.MOCK_EQUIPMENT,
            MOCK_COMPLIANCE_DOCS: allData.MOCK_COMPLIANCE_DOCS,
            MOCK_APPOINTMENTS: allData.MOCK_APPOINTMENTS,
            MOCK_PATIENTS: allData.MOCK_PATIENTS,
            MOCK_LABS: allData.MOCK_LABS,
            MOCK_LAB_CASES: allData.MOCK_LAB_CASES,
            MOCK_COMPLAINTS: allData.MOCK_COMPLAINTS,
        };
        const json = JSON.stringify(dataToBackup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Simulates restoring from a backup.
     * In a real app, this would involve complex logic to wipe and replace data
     * in all services, likely requiring a page reload.
     */
    restoreFromBackup: (backupId: string): Promise<string> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Successfully restored from backup ${backupId}. The application would now reload.`);
            }, 2000);
        });
    },
};