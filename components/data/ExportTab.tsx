
import React, { useState, FC } from 'react';
import { useBranding } from '../../hooks/useBranding';
import { useNotifications } from '../Notification';
import { reportingService } from '../../services/reportingService';
import { complianceService } from '../../services/complianceService';

const ExportTab: FC = () => {
    const { branding } = useBranding();
    const { addNotification } = useNotifications();
    const [reportType, setReportType] = useState('performance');

    const handleExport = async () => {
        if (reportType === 'performance') {
            // FIX: Await the async report generation
            const kpiData = await reportingService.generateReport(new Date(new Date().setDate(new Date().getDate() - 30)), new Date());
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

export default ExportTab;
