import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { complianceService } from '../services/complianceService';
import { ComplianceDocument } from '../types';

const CompliancePage: FC = () => {
    const [documents] = useState(() => complianceService.getDocuments());

    const getStatusStyles = (status: ComplianceDocument['status']) => {
        switch (status) {
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Due Soon': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <SettingsPanel title="Compliance Management">
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Reviewed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {documents.map(doc => {
                            const nextReviewDate = new Date(doc.lastReviewed);
                            nextReviewDate.setDate(nextReviewDate.getDate() + doc.reviewCycleDays);
                            return (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.lastReviewed.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nextReviewDate.toLocaleDateString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </SettingsPanel>
    );
};
export default CompliancePage;