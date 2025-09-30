
// Fix: Corrected import path
import { MOCK_COMPLIANCE_DOCS } from '../constants';
// Fix: Corrected import path
import { ComplianceDocument, Evidence, TenantBranding } from '../types';
import { v4 as uuidv4 } from 'uuid';
// Fix: Corrected import path
import { notificationRuleEngineService } from './notificationRuleEngineService';

// Deep clone mock data for in-memory manipulation.
// JSON stringify/parse converts Date objects to ISO strings, so we must re-hydrate them.
let documents: Omit<ComplianceDocument, 'status'>[] = JSON.parse(JSON.stringify(MOCK_COMPLIANCE_DOCS)).map((d: any) => ({
    ...d,
    lastReviewed: new Date(d.lastReviewed),
    evidence: d.evidence.map((e: any) => ({...e, timestamp: new Date(e.timestamp)}))
}));


const DUE_SOON_THRESHOLD_DAYS = 30;

const calculateStatus = (doc: Omit<ComplianceDocument, 'status'>): ComplianceDocument['status'] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    const nextReviewDate = new Date(doc.lastReviewed);
    nextReviewDate.setDate(nextReviewDate.getDate() + doc.reviewCycleDays);
    
    if (nextReviewDate < today) {
        return 'Overdue';
    }

    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() + DUE_SOON_THRESHOLD_DAYS);

    if (nextReviewDate <= thresholdDate) {
        return 'Due Soon';
    }

    return 'Compliant';
}

export const complianceService = {
  getDocuments: (): ComplianceDocument[] => {
    // Calculate status dynamically every time documents are fetched
    return [...documents].map(doc => ({
        ...doc,
        status: calculateStatus(doc),
    })).sort((a, b) => a.lastReviewed.getTime() - b.lastReviewed.getTime());
  },
  
  getDocumentById: (id: string): ComplianceDocument | undefined => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return undefined;
    return { ...doc, status: calculateStatus(doc) };
  },

  addEvidence: (documentId: string, evidence: Omit<Evidence, 'id' | 'timestamp'>): ComplianceDocument | undefined => {
    const docIndex = documents.findIndex(d => d.id === documentId);
    if (docIndex === -1) return undefined;
    
    const newEvidence: Evidence = {
        ...evidence,
        id: uuidv4(),
        timestamp: new Date(),
    };

    documents[docIndex].evidence.push(newEvidence);
    return complianceService.getDocumentById(documentId);
  },

  reviewDocument: (documentId: string): ComplianceDocument | undefined => {
      const docIndex = documents.findIndex(d => d.id === documentId);
      if (docIndex === -1) return undefined;

      documents[docIndex].lastReviewed = new Date();
      // Optionally, add a note that it was reviewed
      complianceService.addEvidence(documentId, {
          type: 'note',
          content: 'Document reviewed and marked as up-to-date.',
          uploadedBy: 'system', // Or the current user ID
      });

      return complianceService.getDocumentById(documentId);
  },

  checkAndTriggerOverdueNotifications: () => {
    const allDocs = complianceService.getDocuments();
    const overdueDocs = allDocs.filter(doc => doc.status === 'Overdue');
    
    overdueDocs.forEach(doc => {
      notificationRuleEngineService.processEvent('OVERDUE_COMPLIANCE', {
        documentId: doc.id,
        documentName: doc.name,
        category: doc.category,
        responsibleRole: doc.responsibleRoleId,
      });
    });
  },

  exportDocumentsToHtml: (docs: ComplianceDocument[], branding: TenantBranding): string => {
    const tableRows = docs.map(doc => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${doc.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${doc.category}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${doc.lastReviewed.toLocaleDateString()}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${doc.status}</td>
        </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>Compliance Report</title>
          <style>
            body { font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; }
            .header, .footer { text-align: center; padding: 10px; color: #555; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">${branding.pdfHeader}</div>
          <h1 style="text-align: center;">${branding.tenantName} - Compliance Status Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Last Reviewed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">${branding.pdfFooter}</div>
          <script>window.print();</script>
        </body>
      </html>
    `;
  },
};