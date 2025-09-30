

import React, { useState, FC, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
import { inventoryService } from '../services/inventoryService';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
// Fix: Corrected import path
import { StockItem, EquipmentItem, UsageLog, StockLocation } from '../types';
import { SettingsPanel } from './SettingsPage';
import { BellIcon, WrenchScrewdriverIcon, SparklesIcon, QrCodeIcon, ArrowPathIcon } from './icons';
// Fix: Corrected import path
import { rbacService } from '../services/rbacService';
import { locationService } from '../services/locationService';

type InventoryTab = 'dashboard' | 'stock' | 'equipment' | 'reports';
type ScanMode = 'check-in' | 'check-out' | 'audit';
interface ScannedItem {
    id: string; // Unique ID for the scan action itself
    itemCode: string;
    mode: ScanMode;
    quantity: number;
    timestamp: Date;
}

// --- Sub-Components ---

const Dashboard: FC<{
    onGenerateAISuggestions: () => void;
    aiSuggestions: Record<string, number>;
    loadingSuggestions: boolean;
}> = ({ onGenerateAISuggestions, aiSuggestions, loadingSuggestions }) => {
    const lowStockItems = inventoryService.getLowStockItems();
    const equipmentDueService = inventoryService.getEquipmentDueForService();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Low Stock Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 col-span-1">
                <div className="flex items-center">
                    <BellIcon className="h-6 w-6 text-yellow-500 mr-3" />
                    <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alerts</h3>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                    {lowStockItems.length > 0 ? lowStockItems.map(item => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-bold text-red-600">{item.stockLevels.reduce((s, l) => s + l.quantity, 0)} left</span>
                        </li>
                    )) : <p className="text-gray-500">All stock levels are healthy.</p>}
                </ul>
            </div>

            {/* Equipment Service */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 col-span-1">
                <div className="flex items-center">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-blue-500 mr-3" />
                    <h3 className="text-lg font-semibold text-blue-800">Equipment Service Due</h3>
                </div>
                 <ul className="mt-3 space-y-2 text-sm">
                    {equipmentDueService.length > 0 ? equipmentDueService.map(eq => (
                        <li key={eq.id} className="flex justify-between">
                            <span>{eq.name} ({eq.serialNumber})</span>
                            <span className="font-semibold text-orange-600">Due Now</span>
                        </li>
                    )) : <p className="text-gray-500">All equipment is up to date on service.</p>}
                </ul>
            </div>
            
            {/* AI Reorder Suggestions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 col-span-1">
                <div className="flex items-center">
                    <SparklesIcon className="h-6 w-6 text-purple-500 mr-3" />
                    <h3 className="text-lg font-semibold text-purple-800">AI Reorder Suggestions</h3>
                </div>
                <button 
                    onClick={onGenerateAISuggestions}
                    disabled={loadingSuggestions}
                    className="mt-3 w-full text-sm bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center"
                >
                    {loadingSuggestions ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                    {loadingSuggestions ? 'Analyzing Usage...' : 'Generate Suggestions'}
                </button>
                <div className="mt-3 space-y-2 text-sm">
                    {Object.keys(aiSuggestions).length > 0 ? Object.entries(aiSuggestions).map(([itemName, qty]) => (
                         <div key={itemName} className="p-2 bg-white rounded-md flex justify-between items-center">
                             <span>Reorder <span className="font-bold">{qty} units</span> of {itemName}</span>
                         </div>
                    )) : <p className="text-gray-500 mt-2">Click generate to get suggestions based on usage.</p>}
                </div>
            </div>
        </div>
    );
};

const AdjustStockModal: FC<{ item: StockItem; onClose: () => void; onSuccess: () => void }> = ({ item, onClose, onSuccess }) => {
    const allLocations = inventoryService.getLocations();
    const [locationId, setLocationId] = useState(allLocations[0]?.id || '');
    const [quantity, setQuantity] = useState(0);
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();

    const handleSubmit = () => {
        if (quantity === 0) {
            addNotification({ type: 'error', message: 'Quantity cannot be zero.' });
            return;
        }

        const result = inventoryService.adjustStock(item.id, locationId, quantity, currentUser.id);

        if (result.success) {
            addNotification({ type: 'success', message: `Stock for ${item.name} adjusted successfully.` });
            onSuccess();
            onClose();
        } else {
            addNotification({ type: 'error', message: result.message });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-2">Adjust Stock: {item.name}</h3>
                <div className="mb-4 text-sm text-gray-600">
                    <p>Current Levels:</p>
                    <ul className="list-disc list-inside">
                        {item.stockLevels.map(sl => (
                            <li key={sl.locationId}>
                                {allLocations.find(l => l.id === sl.locationId)?.name}: {sl.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <select value={locationId} onChange={e => setLocationId(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            {allLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity to Add / Remove</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="e.g., 10 to add, -2 to remove"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Confirm Adjustment</button>
                </div>
            </div>
        </div>
    );
};

const StockList: FC<{ onAdjustStock: (item: StockItem) => void }> = ({ onAdjustStock }) => {
    const items = inventoryService.getStockItems();
    const { currentUser } = useApp();
    const canWrite = rbacService.can(currentUser.role, 'inventory:write');

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {canWrite && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {items.map(item => {
                        const totalStock = item.stockLevels.reduce((s, l) => s + l.quantity, 0);
                        const isLow = totalStock <= item.reorderPoint;
                        return (
                             <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                    <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-md mr-4 object-cover" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.itemCode}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totalStock} {item.unit}(s)</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isLow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {isLow ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                                {canWrite && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => onAdjustStock(item)} className="text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-md">Adjust Stock</button>
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
};

const EquipmentList: FC = () => {
    const equipment = inventoryService.getEquipment();
    const locations = locationService.getLocations();
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty Expires</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {equipment.map(item => {
                        const nextServiceDate = new Date(item.lastServiceDate);
                        nextServiceDate.setMonth(nextServiceDate.getMonth() + item.serviceIntervalMonths);
                        const isDue = nextServiceDate <= new Date();
                        const location = locations.find(l => l.id === item.locationId);
                        return (
                             <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                    <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-md mr-4 object-cover" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.serialNumber}</div>
                                    </div>
                                </td>
                                {/* Fix: Used locationId to look up the location name. */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.warrantyExpires.toLocaleDateString()}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isDue ? 'text-red-600' : 'text-gray-500'}`}>
                                    {nextServiceDate.toLocaleDateString()}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

const ScanModal: FC<{ onClose: () => void; onProcessQueue: (queue: ScannedItem[]) => void; }> = ({ onClose, onProcessQueue }) => {
    const [mode, setMode] = useState<ScanMode>('check-out');
    const [scannedCode, setScannedCode] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [scanQueue, setScanQueue] = useState<ScannedItem[]>([]);
    const [isOffline, setIsOffline] = useState(false);
    const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'running' | 'error'>('idle');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null); // Use 'any' for BarcodeDetector polyfill
    const scanIntervalRef = useRef<number | null>(null);

    const { addNotification } = useNotifications();
    
    const startScanner = async () => {
        if (!('BarcodeDetector' in window)) {
            addNotification({ type: 'error', message: 'Barcode Detector API is not supported in this browser.' });
            setCameraStatus('error');
            return;
        }
        
        setCameraStatus('starting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            // @ts-ignore
            detectorRef.current = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
            setCameraStatus('running');
        } catch (err) {
            console.error("Camera access error:", err);
            addNotification({ type: 'error', message: 'Could not access camera. Please check permissions.' });
            setCameraStatus('error');
        }
    };

    const stopScanner = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraStatus('idle');
    };

    useEffect(() => {
        startScanner();
        return () => stopScanner();
    }, []);

    useEffect(() => {
        if (cameraStatus === 'running' && !scanIntervalRef.current) {
            scanIntervalRef.current = window.setInterval(async () => {
                if (videoRef.current && detectorRef.current && !videoRef.current.paused && videoRef.current.readyState >= 3) {
                    try {
                        const barcodes = await detectorRef.current.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            const detectedCode = barcodes[0].rawValue;
                            setScannedCode(detectedCode);
                            addNotification({ type: 'info', message: `Scanned: ${detectedCode}` });
                            stopScanner();
                        }
                    } catch (e) {
                        // This can fail if the video isn't ready, so we silently ignore some errors
                        // console.error("Detection failed:", e);
                    }
                }
            }, 500); // Scan every 500ms
        }
        return () => {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        };
    }, [cameraStatus, addNotification]);

    const handleAddToQueue = () => {
        if (!scannedCode) {
            addNotification({ type: 'error', message: 'Scan an item first.' });
            return;
        }
        const newScan: ScannedItem = { id: `scan-${Date.now()}`, itemCode: scannedCode, mode, quantity, timestamp: new Date() };
        setScanQueue(prev => [...prev, newScan]);
        setScannedCode('');
        setQuantity(1);
        addNotification({ type: 'success', message: `Added ${scannedCode} to queue.` });
        startScanner(); // Restart scanner for next item
    };
    
    const handleProcess = () => {
        if(isOffline) {
            addNotification({ type: 'info', message: 'Offline mode is on. Actions are queued.' });
            return;
        }
        onProcessQueue(scanQueue);
        setScanQueue([]);
        onClose();
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4">QR / Barcode Scanner</h3>
                
                <div className="w-full h-48 bg-gray-900 rounded-md flex items-center justify-center text-white mb-4 relative overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    {cameraStatus !== 'running' && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                            <p>{cameraStatus === 'error' ? 'Camera Error' : 'Starting camera...'}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mb-4">
                     <button onClick={scannedCode ? () => { setScannedCode(''); startScanner(); } : startScanner} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center" disabled={cameraStatus === 'starting'}>
                        <QrCodeIcon className="w-5 h-5 mr-2" /> 
                        {scannedCode ? 'Scan Again' : cameraStatus === 'running' ? 'Scanning...' : 'Start Scanner'}
                    </button>
                </div>
                
                <div className="flex items-center justify-center my-4">
                    <label htmlFor="offline-toggle" className="mr-2 text-sm font-medium text-gray-700">Simulate Offline Mode</label>
                    <input type="checkbox" id="offline-toggle" checked={isOffline} onChange={() => setIsOffline(!isOffline)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </div>

                {scannedCode && (
                    <div className="p-4 bg-gray-100 rounded-md mb-4">
                        <p className="font-semibold">Scanned Item: <span className="font-mono text-indigo-900">{scannedCode}</span></p>
                        <div className="mt-2 flex items-center space-x-4">
                            <select value={mode} onChange={e => setMode(e.target.value as ScanMode)} className="rounded-md border-gray-300">
                                <option value="check-out">Check-Out</option>
                                <option value="check-in">Check-In</option>
                                <option value="audit">Audit</option>
                            </select>
                            <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 rounded-md border-gray-300"/>
                             <button onClick={handleAddToQueue} className="bg-green-600 text-white px-4 py-1 rounded-md text-sm">Add to Queue</button>
                        </div>
                    </div>
                )}
                
                <div className="mb-4 h-32 overflow-y-auto border p-2 rounded-md">
                    <h4 className="font-semibold text-sm">Scan Queue ({scanQueue.length})</h4>
                    {scanQueue.length === 0 ? <p className="text-xs text-gray-500">No items in queue.</p> : (
                        <ul className="text-xs space-y-1 mt-1">
                            {scanQueue.map(s => (
                                <li key={s.id} className="flex justify-between bg-gray-50 p-1 rounded">
                                    <span>{s.itemCode} ({s.mode})</span>
                                    <span>Qty: {s.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleProcess} className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400" disabled={scanQueue.length === 0}>
                        {isOffline ? `Process Later (${scanQueue.length})` : 'Process Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- Main Component ---

const InventoryPage: FC = () => {
    const [activeTab, setActiveTab] = useState<InventoryTab>('dashboard');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [adjustingItem, setAdjustingItem] = useState<StockItem | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, number>>({});
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    // FIX: Changed state to be a number for valid React key usage. A boolean is not a valid key.
    const [forceRefresh, setForceRefresh] = useState(0); // To force re-render

    const { addNotification } = useNotifications();
    const { currentUser } = useApp();

    const handleGenerateAISuggestions = async () => {
        setLoadingSuggestions(true);
        const lowStockItems = inventoryService.getLowStockItems();
        if (lowStockItems.length === 0) {
            addNotification({ type: 'info', message: 'No low stock items to analyze.'});
            setLoadingSuggestions(false);
            return;
        }

        try {
            const suggestions: Record<string, number> = {};
            for (const item of lowStockItems) {
                const usageHistory = inventoryService.getUsageLogsForItem(item.id)
                    .map(log => ({ date: log.date, quantity: log.quantityUsed }));
                
                if (usageHistory.length > 0) {
                    const result = await aiOrchestrationService.runTask<{ suggestedQuantity: number }>('INVENTORY_REORDER', { itemName: item.name, usageHistory });
                    if (result.suggestedQuantity) {
                       suggestions[item.name] = result.suggestedQuantity;
                    }
                }
            }
            setAiSuggestions(suggestions);
        } catch (error: any) {
            addNotification({ type: 'error', message: `AI suggestion failed: ${error.message}` });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const processScanQueue = (queue: ScannedItem[]) => {
        const processedCodes = new Set<string>(); // Handle duplicate scans in the same queue
        let successCount = 0;
        let failCount = 0;
        
        queue.forEach(scan => {
            if(processedCodes.has(`${scan.itemCode}-${scan.mode}`)) return; // Skip duplicate
            
            const item = inventoryService.getStockItems().find(i => i.itemCode === scan.itemCode);
            if (!item) {
                failCount++;
                return;
            };

            if (scan.mode === 'check-in' || scan.mode === 'check-out') {
                const quantityChange = scan.mode === 'check-in' ? scan.quantity : -scan.quantity;
                // For simplicity, we apply the change to the first location. A real app would prompt.
                const locationId = item.stockLevels[0]?.locationId || inventoryService.getLocations()[0].id;

                const result = inventoryService.adjustStock(item.id, locationId, quantityChange, currentUser.id);
                if (result.success) {
                    successCount++;
                    processedCodes.add(`${scan.itemCode}-${scan.mode}`);
                } else {
                    failCount++;
                    addNotification({type: 'error', message: `Failed ${scan.itemCode}: ${result.message}`})
                }
            }
        });
        
         addNotification({ type: 'success', message: `Processed ${successCount} actions from queue. ${failCount > 0 ? `${failCount} failed.` : ''}`});
         // FIX: Updated state updater to increment a number, not toggle a boolean.
         setForceRefresh(p => p + 1); // Refresh the list
    };
    
    // Key for re-rendering child components
    const componentKey = useMemo(() => forceRefresh, [forceRefresh]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard key={componentKey} onGenerateAISuggestions={handleGenerateAISuggestions} aiSuggestions={aiSuggestions} loadingSuggestions={loadingSuggestions} />;
            case 'stock':
                return <StockList key={componentKey} onAdjustStock={setAdjustingItem} />;
            case 'equipment':
                return <EquipmentList key={componentKey} />;
            case 'reports':
                return <p>Reporting functionality coming soon.</p>;
            default:
                return null;
        }
    };
    
    const TabButton: FC<{ tabName: InventoryTab; label: string }> = ({ tabName, label }) => (
         <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}
        >
            {label}
        </button>
    );

    return (
        <SettingsPanel title="Inventory & Equipment Management">
            {isScannerOpen && <ScanModal onClose={() => setIsScannerOpen(false)} onProcessQueue={processScanQueue} />}
            {/* FIX: Updated state updater to increment a number, not toggle a boolean. */}
            {adjustingItem && <AdjustStockModal item={adjustingItem} onClose={() => setAdjustingItem(null)} onSuccess={() => setForceRefresh(p => p + 1)} />}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2 border-b">
                        <TabButton tabName="dashboard" label="Dashboard" />
                        <TabButton tabName="stock" label="Stock Items" />
                        <TabButton tabName="equipment" label="Equipment" />
                        <TabButton tabName="reports" label="Reports" />
                    </div>
                    <div>
                         <button 
                            onClick={() => setIsScannerOpen(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                         >
                            <QrCodeIcon className="w-5 h-5 mr-2" /> Scan Item
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    {renderTabContent()}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default InventoryPage;