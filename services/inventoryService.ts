import { MOCK_STOCK_ITEMS, MOCK_EQUIPMENT } from '../constants';
import { StockItem, EquipmentItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STOCK_ITEMS_KEY = 'dentalos_stockItems';
const EQUIPMENT_KEY = 'dentalos_equipment';

// Initialize stock items from localStorage or mock data
let stockItems: StockItem[] = (() => {
    const saved = localStorage.getItem(STOCK_ITEMS_KEY);
    if (saved) return JSON.parse(saved);
    const initial = MOCK_STOCK_ITEMS.map((item, index) => ({ ...item, id: `item-${index + 1}` }));
    localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(initial));
    return initial;
})();

// Initialize equipment from localStorage or mock data, with date re-hydration
let equipment: EquipmentItem[] = (() => {
    const saved = localStorage.getItem(EQUIPMENT_KEY);
    const data = saved ? JSON.parse(saved) : MOCK_EQUIPMENT.map((item, index) => ({ ...item, id: `equip-${index + 1}` }));
    const hydratedData = data.map((item: any) => ({
        ...item,
        purchaseDate: new Date(item.purchaseDate),
        warrantyExpires: new Date(item.warrantyExpires),
        lastServiceDate: new Date(item.lastServiceDate),
    }));
    if (!saved) {
        localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(hydratedData));
    }
    return hydratedData;
})();


const persistStock = () => localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(stockItems));
const persistEquipment = () => localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));

export const inventoryService = {
    getStockItems: (): StockItem[] => {
        return [...stockItems];
    },

    getEquipment: (): EquipmentItem[] => {
        return [...equipment];
    },

    getLowStockItems: (): StockItem[] => {
        return stockItems.filter(item => {
            const totalStock = item.stockLevels.reduce((acc, level) => acc + level.quantity, 0);
            return totalStock <= item.reorderPoint;
        });
    },

    addMultipleStockItems: (items: Omit<StockItem, 'id'>[]): void => {
        const newItems: StockItem[] = items.map(item => ({
            ...item,
            id: `item-${uuidv4()}`
        }));
        stockItems.push(...newItems);
        persistStock();
    },
};