

import { qualityService } from './qualityService';
import { TenantBranding } from '../types';
import { cachingService } from './cachingService';


export interface KPIData {
    avgLabTurnaround: number;
    labSlaCompliance: number;
    avgComplaintResolutionTime: number;
}

const KPI_METRICS_CONFIG: { key: keyof KPIData, label: string, unit: string }[] = [
    { key: 'avgLabTurnaround', label: 'Avg Lab Turnaround', unit: ' days' },
    { key: 'labSlaCompliance', label: 'Lab SLA Compliance', unit: '%' },
    { key: 'avgComplaintResolutionTime', label: 'Avg Complaint Resolution', unit: ' days' },
];

export const reportingService = {
    /**
     * Generates a report with key performance indicators for a given date range.
     * @param startDate The start of the date range.
     * @param endDate The end of the date range.
     * @returns An object containing calculated KPIs.
     */
    generateReport: async (startDate: Date, endDate: Date): Promise<KPIData> => {
        const cacheKey = `report-${startDate.toISOString()}-${endDate.toISOString()}`;
        const cachedData = cachingService.get<KPIData>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        // --- Quality KPIs ---
        const avgLabTurnaround = await qualityService.getAverageLabTurnaround();
        const labCases = await qualityService.getLabCases();
        const overdueLabs = labCases.filter(c => c.status === 'overdue').length;
        const labSlaCompliance = labCases.length > 0 ? ((labCases.length - overdueLabs) / labCases.length) * 100 : 100;
        const avgComplaintResolutionTime = await qualityService.getAverageComplaintResolutionTime();

        const result: KPIData = {
            avgLabTurnaround: parseFloat(avgLabTurnaround.toFixed(1)),
            labSlaCompliance: parseFloat(labSlaCompliance.toFixed(1)),
            avgComplaintResolutionTime: parseFloat(avgComplaintResolutionTime.toFixed(1)),
        };

        cachingService.set(cacheKey, result, 300); // Cache for 5 minutes
        return result;
    },

    exportReportToHtml: (kpiData: KPIData, branding: TenantBranding, dateRange: {start: Date, end: Date}): string => {
        const kpiItems = KPI_METRICS_CONFIG.map(({key, label, unit}) => `
            <div style="padding: 16px; border: 1px solid #eee; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0; color: #555; font-size: 14px;">${label}</h3>
                <p style="margin: 4px 0 0; font-size: 28px; font-weight: bold; color: #111;">
                    ${kpiData[key]}${unit}
                </p>
            </div>
        `).join('');

        return `
          <html>
            <head>
              <title>Performance Report</title>
              <style>
                body { font-family: sans-serif; }
                .header, .footer { text-align: center; padding: 10px; color: #555; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="header">${branding.pdfHeader}</div>
              <h1 style="text-align: center; color: ${branding.primaryColor};">${branding.tenantName} - Performance Report</h1>
              <h2 style="text-align: center; font-weight: normal; font-size: 16px; color: #333;">
                ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}
              </h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px;">
                ${kpiItems}
              </div>
              <div class="footer">${branding.pdfFooter}</div>
              <script>window.print();</script>
            </body>
          </html>
        `;
    },
};