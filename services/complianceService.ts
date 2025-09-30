import { MOCK_COMPLIANCE_DOCS } from '../constants';
import { ComplianceDocument, TenantBranding } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { notificationRuleEngineService } from './notificationRuleEngineService';

let documents: ComplianceDocument[] = JSON.parse(JSON.stringify(MOCK_COMPLIANCE_DOCS)).map((doc: Omit<ComplianceDocument, 'id' | 'status'>, index: number) => ({
    ...doc,
    id: `doc-${index+1}`,
    lastReviewed: new Date(doc.lastReviewed),
    status: 'Compliant' // Will be calculated dynamically
}));

const calculateStatus = (doc: ComplianceDocument): ComplianceDocument['status'] => {
    const today = new Date();
    const dueDate = new Date(doc.lastReviewed);
    dueDate.setDate(dueDate.getDate() + doc.reviewCycleDays);

    const daysUntilDue = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (daysUntilDue < 0) return 'Overdue';
    if (daysUntilDue <= 30) return 'Due Soon';
    return 'Compliant';
};

export const complianceService = {
    getDocuments: (): ComplianceDocument[] => {
        return [...documents].map(doc => ({
            ...doc,
            status: calculateStatus(doc)
        }));
    },
    
    checkAndTriggerOverdueNotifications: (): void => {
        const allDocs = complianceService.getDocuments();
        const overdueDocs = allDocs.filter(d => d.status === 'Overdue');
        overdueDocs.forEach(doc => {
            notificationRuleEngineService.processEvent('OVERDUE_COMPLIANCE', {
                documentName: doc.name
            });
        });
    },

    exportDocumentsToHtml: (docs: ComplianceDocument[], branding: TenantBranding): string => {
        const docRows = docs.map(doc => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${doc.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${doc.category}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${doc.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(doc.lastReviewed).toLocaleDateString()}</td>
            </tr>
        `).join('');

        return `
          <html>
            <head><title>Compliance Report</title></head>
            <body>
              <h1 style="color: ${branding.primaryColor};">${branding.tenantName} - Compliance Report</h1>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Document</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Category</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Last Reviewed</th>
                  </tr>
                </thead>
                <tbody>${docRows}</tbody>
              </table>
              <script>window.print();</script>
            </body>
          </html>
        `;
    }
};