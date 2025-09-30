
// Fix: Corrected import path
import { MOCK_STOCK_ITEMS, MOCK_EQUIPMENT } from '../constants';
// Fix: Corrected import path
import { StockItem, EquipmentItem, UsageLog, StockLocation } from '../types';
import { v4 as uuidv4 } from 'uuid';
// Fix: Corrected import path
import { auditLogService } from './auditLogService';

let stockItems: StockItem[] = JSON.parse(JSON.stringify(MOCK_STOCK_ITEMS));
let equipment: EquipmentItem[] = JSON.parse(JSON.stringify(MOCK_EQUIPMENT)).map((e: any) => ({ ...e, purchaseDate: new Date(e.purchaseDate), warrantyExpires: new Date(e.warrantyExpires), lastServiceDate: new Date(e.lastServiceDate) }));
let usageLogs: UsageLog[] = [];
const locations: StockLocation[] = [
    { id: 'loc-1', name: 'Main Storage' },
    { id: 'loc-2', name: 'Sterilization Room' },
];

export const inventoryService = {
    getStockItems: (): StockItem[] => [...stockItems],
    getEquipment: (): EquipmentItem[] => [...equipment],
    getLocations: (): StockLocation[] => [...locations],

    getLowStockItems: (): StockItem[] => {
        return stockItems.filter(item => {
            const totalStock = item.stockLevels.reduce((sum, loc) => sum + loc.quantity, 0);
            return totalStock <= item.reorderPoint;
        });
    },

    getEquipmentDueForService: (): EquipmentItem[] => {
        return equipment.filter(eq => {
            const nextServiceDate = new Date(eq.lastServiceDate);
            nextServiceDate.setMonth(nextServiceDate.getMonth() + eq.serviceIntervalMonths);
            return nextServiceDate <= new Date();
        });
    },

    adjustStock: (itemId: string, locationId: string, quantityChange: number, userId: string): { success: boolean, message: string } => {
        const itemIndex = stockItems.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return { success: false, message: "Item not found." };

        const item = stockItems[itemIndex];
        const locIndex = item.stockLevels.findIndex(sl => sl.locationId === locationId);

        if (locIndex === -1) {
            if (quantityChange < 0) return { success: false, message: "Cannot remove stock from a location with zero quantity." };
            item.stockLevels.push({ locationId, quantity: quantityChange });
        } else {
            const newQuantity = item.stockLevels[locIndex].quantity + quantityChange;
            if (newQuantity < 0) return { success: false, message: `Not enough stock in ${locations.find(l => l.id === locationId)?.name}.` };
            item.stockLevels[locIndex].quantity = newQuantity;
        }

        if (quantityChange < 0) {
            usageLogs.push({
                id: uuidv4(),
                itemId,
                quantityUsed: Math.abs(quantityChange),
                usedBy: userId,
                date: new Date(),
            });
        }
        
        // Audit log might be too noisy for every adjustment, but good for demo
        // auditLogService.log(userId, 'User', 'Inventory stock adjusted', { itemId, locationId, quantityChange });

        return { success: true, message: "Stock adjusted." };
    },
    
    getUsageLogsForItem: (itemId: string): UsageLog[] => {
        return usageLogs.filter(log => log.itemId === itemId);
    },

    addMultipleStockItems: (items: Omit<StockItem, 'id'>[]): void => {
        const newItems: StockItem[] = items.map(item => ({
            ...item,
            id: `item-${uuidv4()}`
        }));
        stockItems.push(...newItems);
    }
};