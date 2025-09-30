import React, { useState, FC } from 'react';
import { useNotifications } from '../Notification';
import { storageService } from '../../services/storageService';
import { importService, CsvRow, ValidationResult } from '../../services/importService';

type ImportStage = '1-upload' | '2-map' | '3-preview' | '4-complete';

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

export default ImportTab;
