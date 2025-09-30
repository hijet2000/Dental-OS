import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { inventoryService } from '../services/inventoryService';
import { StockItem, EquipmentItem } from '../types';
import { SparklesIcon } from './icons';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { useNotifications } from './Notification';

const InventoryPage: FC = () => {
    const [stockItems] = useState(() => inventoryService.getStockItems());
    const [equipment] = useState(() => inventoryService.getEquipment());
    const { addNotification } = useNotifications();
    const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

    const handleReorderSuggestion = async (item: StockItem) => {
        setLoadingSuggestion(item.id);
        try {
            // FIX: Provide both generic type arguments to runTask.
            const result = await aiOrchestrationService.runTask<{ suggestedQuantity: number }, 'INVENTORY_REORDER'>('INVENTORY_REORDER', {
                itemName: item.name,
                // Fake usage history for demo
                usageHistory: [
                    { date: '2023-10-01', quantityUsed: 5 },
                    { date: '2023-09-15', quantityUsed: 3 },
                ]
            });
            addNotification({ type: 'info', message: `AI suggests reordering ${result.suggestedQuantity} units of ${item.name}.`});
        } catch (error: any) {
            addNotification({ type: 'error', message: `AI failed: ${error.message}` });
        } finally {
            setLoadingSuggestion(null);
        }
    };

    return (
        <SettingsPanel title="Inventory Management">
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Stock Items</h3>
                    <div className="bg-white shadow rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Point</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stockItems.map(item => {
                                    const totalStock = item.stockLevels.reduce((sum, loc) => sum + loc.quantity, 0);
                                    const isLow = totalStock <= item.reorderPoint;
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{totalStock} {item.unit}(s)</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reorderPoint}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isLow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {isLow ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {isLow && (
                                                    <button onClick={() => handleReorderSuggestion(item)} disabled={loadingSuggestion === item.id} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                                                        <SparklesIcon className="w-4 h-4 mr-1" />
                                                        {loadingSuggestion === item.id ? 'Thinking...' : 'AI Suggest Reorder'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Equipment</h3>
                    <div className="bg-white shadow rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Service</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {equipment.map(item => {
                                    const nextServiceDate = new Date(item.lastServiceDate);
                                    nextServiceDate.setMonth(nextServiceDate.getMonth() + item.serviceIntervalMonths);
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.lastServiceDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nextServiceDate.toLocaleDateString()}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SettingsPanel>
    );
};
export default InventoryPage;