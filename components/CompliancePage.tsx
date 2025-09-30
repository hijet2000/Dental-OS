
import React, { FC, useState } from 'react';
import { SettingsPanel } from './SettingsPage';
import { complianceService } from '../services/complianceService';
// Fix: Corrected import path
import { ComplianceDocument, Evidence } from '../types';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
import { fileToBase64 } from '../utils';

const CompliancePage: FC = () => {
    const { currentUser } = useApp();
    const { addNotification } = useNotifications();
    const [documents, setDocuments] = useState(complianceService.getDocuments());
    const [selectedDoc, setSelectedDoc] = useState<ComplianceDocument | null>(null);

    const handleReview = (docId: string) => {
        complianceService.reviewDocument(docId);
        setDocuments(complianceService.getDocuments());
        addNotification({ type: 'success', message: 'Document review logged.' });
    };
    
    const handleAddEvidence = async (docId: string, file: File) => {
        const base64 = await fileToBase64(file);
        const newEvidence: Omit<Evidence, 'id' | 'timestamp'> = {
            type: file.type.startsWith('image/') ? 'photo' : 'file',
            content: base64,
            fileName: file.name,
            uploadedBy: currentUser.id,
        };
        complianceService.addEvidence(docId, newEvidence);
        setDocuments(complianceService.getDocuments());
        const updatedDoc = complianceService.getDocumentById(docId);
        if (updatedDoc) setSelectedDoc(updatedDoc);
        addNotification({ type: 'success', message: 'Evidence uploaded.' });
    };

    const getStatusStyles = (status: ComplianceDocument['status']) => {
        if (status === 'Overdue') return 'bg-red-100 text-red-800';
        if (status === 'Due Soon') return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <SettingsPanel title="Compliance Management">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Document List */}
                <div className="md:col-span-1">
                    <ul className="space-y-2">
                        {documents.map(doc => (
                            <li key={doc.id}>
                                <button
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`w-full text-left p-3 rounded-md border ${selectedDoc?.id === doc.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <p className="font-semibold">{doc.name}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusStyles(doc.status)}`}>{doc.status}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Document Details */}
                <div className="md:col-span-2">
                    {selectedDoc ? (
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="text-lg font-bold">{selectedDoc.name}</h3>
                            <p className="text-sm text-gray-500">{selectedDoc.category}</p>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold">Last Reviewed:</span> {selectedDoc.lastReviewed.toLocaleDateString()}</div>
                                <div><span className="font-semibold">Review Cycle:</span> {selectedDoc.reviewCycleDays} days</div>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Evidence ({selectedDoc.evidence.length})</h4>
                                <ul className="text-sm space-y-2">
                                    {selectedDoc.evidence.map(e => (
                                        <li key={e.id} className="p-2 bg-gray-50 rounded-md">
                                            {e.fileName || e.type} - Uploaded {e.timestamp.toLocaleDateString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="mt-6 flex space-x-3">
                                <button onClick={() => handleReview(selectedDoc.id)} className="bg-green-600 text-white px-4 py-2 rounded-md">Mark as Reviewed</button>
                                <label className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer">
                                    Upload Evidence
                                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleAddEvidence(selectedDoc.id, e.target.files[0])} />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Select a document to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default CompliancePage;