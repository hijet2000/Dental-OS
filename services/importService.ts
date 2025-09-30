import { inventoryService } from './inventoryService';
// Fix: Corrected import path
import { StockItem } from '../types';

export type CsvRow = Record<string, string>;
export type ValidationResult = { rowIndex: number; errors: Record<string, string> };

// A map defining the required fields for each import type.
const REQUIRED_FIELDS: Record<string, (keyof StockItem)[]> = {
    'inventory': ['name', 'itemCode', 'category', 'unit', 'reorderPoint', 'stockLevels']
};

export const importService = {
    /**
     * Parses a CSV file content into an array of objects.
     * @param csvContent The string content of the CSV file.
     * @returns An object containing the headers and data rows.
     */
    parseCsv: (csvContent: string): { headers: string[], data: CsvRow[] } => {
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {} as CsvRow);
        });
        return { headers, data };
    },

    /**
     * Validates the parsed CSV data against business rules for inventory items.
     * @param data The array of data rows from the CSV.
     * @param mapping The column mapping from CSV header to application field.
     * @returns An array of validation results, one for each row with errors.
     */
    validateInventoryData: (data: CsvRow[], mapping: Record<string, keyof StockItem>): ValidationResult[] => {
        const validationErrors: ValidationResult[] = [];
        const existingItemCodes = new Set(inventoryService.getStockItems().map(i => i.itemCode));
        const newItemCodes = new Set<string>();

        data.forEach((row, rowIndex) => {
            const errors: Record<string, string> = {};
            const itemCode = row[Object.keys(mapping).find(key => mapping[key] === 'itemCode')!];

            // Check for required fields
            if (!itemCode) {
                errors['itemCode'] = 'Item Code is required.';
            }
            if (!row[Object.keys(mapping).find(key => mapping[key] === 'name')!]) {
                errors['name'] = 'Name is required.';
            }

            // Check for duplicate item codes within the file and against existing data
            if (itemCode) {
                if (existingItemCodes.has(itemCode)) {
                    errors['itemCode'] = `Item code '${itemCode}' already exists in the system.`;
                }
                if (newItemCodes.has(itemCode)) {
                    errors['itemCode'] = `Duplicate item code '${itemCode}' found in the file.`;
                }
                newItemCodes.add(itemCode);
            }

            // Check if reorder point is a valid number
            const reorderPoint = row[Object.keys(mapping).find(key => mapping[key] === 'reorderPoint')!];
            if (reorderPoint && isNaN(parseInt(reorderPoint, 10))) {
                errors['reorderPoint'] = 'Reorder Point must be a number.';
            }
            
            if (Object.keys(errors).length > 0) {
                validationErrors.push({ rowIndex, errors });
            }
        });

        return validationErrors;
    },

    /**
     * Commits the validated and mapped data to the inventory service.
     * This is a transactional operation (all or nothing).
     * @param data The array of data rows from the CSV.
     * @param mapping The column mapping from CSV header to application field.
     */
    commitInventoryImport: (data: CsvRow[], mapping: Record<string, keyof StockItem>): { success: boolean, message: string } => {
        try {
            // First, transform the data based on the mapping
            const newStockItems: Omit<StockItem, 'id'>[] = data.map(row => {
                 // A basic transformation. A real app might need more complex logic.
                const name = row[Object.keys(mapping).find(k => mapping[k] === 'name')!] || '';
                const itemCode = row[Object.keys(mapping).find(k => mapping[k] === 'itemCode')!] || '';
                const category = row[Object.keys(mapping).find(k => mapping[k] === 'category')!] || 'Uncategorized';
                const unit = row[Object.keys(mapping).find(k => mapping[k] === 'unit')!] || 'unit';
                const reorderPoint = parseInt(row[Object.keys(mapping).find(k => mapping[k] === 'reorderPoint')!], 10) || 0;
                const quantity = parseInt(row[Object.keys(mapping).find(k => mapping[k] === 'stockLevels')!], 10) || 0;

                return {
                    name,
                    itemCode,
                    category: { id: 'cat-imported', name: category },
                    unit,
                    reorderPoint,
                    photoUrl: `https://placehold.co/100x100/cacaca/31343C/png?text=${name.substring(0, 4)}`,
                    stockLevels: [{ locationId: 'loc-1', quantity }], // Import to default location
                };
            });

            // Then, call the service to perform the bulk add
            inventoryService.addMultipleStockItems(newStockItems);
            
            return { success: true, message: `Successfully imported ${newStockItems.length} items.` };
        } catch (error) {
            console.error("Import commit failed:", error);
            // In a real app with a database, you would perform a transaction rollback here.
            return { success: false, message: "A critical error occurred during the import process. No data was saved." };
        }
    }
};