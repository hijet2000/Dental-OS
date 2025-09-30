import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useNotifications } from './Notification';
import { useBranding } from '../hooks/useBranding';
// Fix: Corrected import path
import { Backup } from '../types';
import { backupService } from '../services/backupService';
import { storageService } from '../services/storageService';
import { importService, CsvRow, ValidationResult } from '../services/importService';
import { reportingService } from '../services/reportingService';
import { complianceService } from '../services/complianceService';

type DataTab = 'backup' | 'import' | 'export';
type ImportStage = '1-upload' | '2-map' | '3-preview' | '4-complete';

// --- Sub-Components ---

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

const ImportTab: FC = () => {
    const { addNotification } = useNotifications();
    const [stage, setStage] = useState<ImportStage>('1-upload');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<{ headers: string[], data: CsvRow[] } | null>(null);
    const [mapping, setMapping] = useState<Record<string, any>>({});
    const [validationErrors, setValidationErrors] = useState<ValidationResult[]>([]);
    
    const INVENTORY_FIELDS = ['name', 'itemCode', 'category', 'unit', 'reorderPoint', 'stockLevels'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
        } else {
            addNotification({ type: 'error', message: 'Please select a valid CSV file.' });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        // Simulate pre-signed URL flow
        await storageService.getPresignedUploadUrl(file.name, file.type);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const parsed = importService.parseCsv(content);
            setParsedData(parsed);
            // Auto-map based on header names
            const initialMapping: Record<string, string> = {};
            parsed.headers.forEach(header => {
                const lowerHeader = header.toLowerCase().replace(/\s/g, '');
                const foundField = INVENTORY_FIELDS.find(f => lowerHeader.includes(f.toLowerCase()));
                if (foundField) {
                    initialMapping[header] = foundField;
                }
            });
            setMapping(initialMapping);
            setStage('2-map');
        };
        reader.readAsText(file);
    };

    const handleMapAndValidate = () => {
        if (!parsedData) return;
        const errors = importService.validateInventoryData(parsedData.data, mapping);
        setValidationErrors(errors);
        setStage('3-preview');
    };
    
    const handleCommit = () => {
        if (!parsedData) return;
        const result = importService.commitInventoryImport(parsedData.data, mapping);
        if (result.success) {
            addNotification({ type: 'success', message: result.message });
            setStage('4-complete');
        } else {
            addNotification({ type: 'error', message: result.message });
        }
    }
    
    const resetImporter = () => {
        setStage('1-upload');
        setFile(null);
        setParsedData(null);
        setMapping({});
        setValidationErrors([]);
    }

    return (
         <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-1">CSV Data Importer</h3>
            <p className="text-sm text-gray-500 mb-4">Import inventory items from a CSV file.</p>
            
            {/* Stage 1: Upload */}
            {stage === '1-upload' && (
                <div>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    <button onClick={handleUpload} disabled={!file} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">Next: Map Columns</button>
                </div>
            )}
            
            {/* Stage 2: Map */}
            {stage === '2-map' && parsedData && (
                <div>
                    <h4 className="font-semibold mb-2">Map CSV Columns to Fields</h4>
                    <div className="grid grid-cols-2 gap-4">
                    {parsedData.headers.map(header => (
                        <div key={header}>
                            <label className="block text-sm font-medium text-gray-700">{header}</label>
                            <select value={mapping[header] || ''} onChange={e => setMapping({...mapping, [header]: e.target.value})} className="mt-1 w-full p-2 border rounded-md">
                                <option value="">-- Ignore --</option>
                                {INVENTORY_FIELDS.map(field => <option key={field} value={field}>{field}</option>)}
                            </select>
                        </div>
                    ))}
                    </div>
                    <button onClick={handleMapAndValidate} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md">Next: Preview & Validate</button>
                </div>
            )}

            {/* Stage 3: Preview */}
            {stage === '3-preview' && parsedData && (
                <div>
                    <h4 className="font-semibold mb-2">Preview & Validation</h4>
                     {validationErrors.length > 0 ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 mb-4">
                            <p className="font-bold">{validationErrors.length} validation error(s) found. Please fix your CSV and re-upload.</p>
                        </div>
                    ) : (
                         <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 mb-4">
                            <p className="font-bold">Validation successful! Ready to import {parsedData.data.length} items.</p>
                        </div>
                    )}
                    <div className="h-48 overflow-auto border rounded-md">
                        <table className="min-w-full text-sm">
                            <thead><tr className="bg-gray-50">{parsedData.headers.map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
                            <tbody>
                               {parsedData.data.slice(0, 5).map((row, i) => <tr key={i}>{Object.values(row).map((val, j) => <td key={j} className="p-2 border-t">{val}</td>)}</tr>)}
                            </tbody>
                        </table>
                    </div>
                     <button onClick={handleCommit} disabled={validationErrors.length > 0} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">Commit Import</button>
                </div>
            )}
            
            {/* Stage 4: Complete */}
            {stage === '4-complete' && (
                <div className="text-center">
                    <p className="text-lg font-semibold text-green-700">Import Complete!</p>
                    <button onClick={resetImporter} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md">Start New Import</button>
                </div>
            )}
        </div>
    );
};


const ExportTab: FC = () => {
    const { branding } = useBranding();
    const { addNotification } = useNotifications();
    const [reportType, setReportType] = useState('performance');

    const handleExport = () => {
        if (reportType === 'performance') {
            const kpiData = reportingService.generateReport(new Date(new Date().setDate(new Date().getDate() - 30)), new Date());
            const htmlContent = reportingService.exportReportToHtml(kpiData, branding, {start: new Date(new Date().setDate(new Date().getDate() - 30)), end: new Date()});
            const win = window.open("", "Performance Report", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=600");
            win?.document.write(htmlContent);
            win?.document.close();
        } else if (reportType === 'compliance') {
            const docs = complianceService.getDocuments();
            const htmlContent = complianceService.exportDocumentsToHtml(docs, branding);
            const win = window.open("", "Compliance Report", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=600");
            win?.document.write(htmlContent);
            win?.document.close();
        }
        addNotification({type: 'success', message: 'Export is being generated in a new tab.'});
    };

    return (
         <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-1">Data Exports</h3>
            <p className="text-sm text-gray-500 mb-4">Export key data as a watermarked PDF.</p>
             <div className="flex items-center space-x-4">
                <select value={reportType} onChange={e => setReportType(e.target.value)} className="p-2 border rounded-md">
                    <option value="performance">Performance Report (Last 30 Days)</option>
                    <option value="compliance">Compliance Document Status</option>
                </select>
                <button onClick={handleExport} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Export as PDF</button>
             </div>
         </div>
    );
};


// --- Main Component ---
const DataManagementPage: FC = () => {
    const [activeTab, setActiveTab] = useState<DataTab>('backup');
    
    const TabButton: FC<{ tabName: DataTab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
        >
            {label}
        </button>
    );

    return (
        <SettingsPanel title="Data Management">
             <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <TabButton tabName="backup" label="Backup & Restore" />
                    <TabButton tabName="import" label="Import from CSV" />
                    <TabButton tabName="export" label="Export Data" />
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