

import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { patientBillingService } from '../services/patientBillingService';
import { useNotifications } from './Notification';
import { Patient, PatientInvoice, PatientPayment, InsuranceClaim } from '../types';

const PatientBillingPage: FC<{ patient: Patient }> = ({ patient }) => {
    const { addNotification } = useNotifications();
    
    // State to hold and refresh data
    const [refreshKey, setRefreshKey] = useState(0);
    const invoices = useMemo(() => patientBillingService.getInvoicesForPatient(patient.id), [patient.id, refreshKey]);
    const payments = useMemo(() => patientBillingService.getPaymentsForPatient(patient.id), [patient.id, refreshKey]);
    const claims = useMemo(() => patientBillingService.getClaimsForPatient(patient.id), [patient.id, refreshKey]);

    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [processingClaim, setProcessingClaim] = useState<string | null>(null);

    const handleRecordPayment = async (invoiceId: string, amount: number) => {
        setProcessingPayment(invoiceId);
        try {
            await patientBillingService.recordPayment(patient.id, invoiceId, amount, 'credit_card');
            addNotification({ type: 'success', message: 'Payment recorded successfully.' });
            setRefreshKey(k => k + 1); // Trigger re-fetch
        } catch (error: any) {
            addNotification({ type: 'error', message: `Payment failed: ${error.message}` });
        } finally {
            setProcessingPayment(null);
        }
    };

    const handleCreateClaim = async (invoiceId: string) => {
        setProcessingClaim(invoiceId);
        try {
            await patientBillingService.createClaim(invoiceId);
            addNotification({ type: 'success', message: 'Insurance claim submitted.' });
            setRefreshKey(k => k + 1);
        } catch (error: any) {
            addNotification({ type: 'error', message: `Claim submission failed: ${error.message}` });
        } finally {
            setProcessingClaim(null);
        }
    };

    const getStatusStyles = (status: PatientInvoice['status']) => {
        if (status === 'paid') return 'bg-green-100 text-green-800';
        if (status === 'overdue') return 'bg-red-100 text-red-800';
        return 'bg-blue-100 text-blue-800';
    };

    return (
        <SettingsPanel title={`Billing for ${patient.name}`}>
            <div className="space-y-8">
                {/* Invoices */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Invoices</h3>
                    <div className="bg-white shadow rounded-lg divide-y">
                        {invoices.map(invoice => (
                            <div key={invoice.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">Invoice #{invoice.id.split('-')[1].substring(0, 6)}</p>
                                        <p className="text-sm text-gray-500">Date: {invoice.date.toLocaleDateString()}</p>
                                    </div>
                                    <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${getStatusStyles(invoice.status)}`}>{invoice.status}</span>
                                </div>
                                <div className="text-right mt-2">
                                    <p className="text-2xl font-light">${invoice.total.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">Paid: ${invoice.amountPaid.toFixed(2)}</p>
                                </div>
                                {invoice.status !== 'paid' && (
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button 
                                            onClick={() => handleRecordPayment(invoice.id, invoice.total - invoice.amountPaid)}
                                            disabled={processingPayment === invoice.id}
                                            className="text-sm bg-green-600 text-white px-3 py-1 rounded-md disabled:bg-gray-400"
                                        >
                                            {processingPayment === invoice.id ? 'Processing...' : 'Record Card Payment'}
                                        </button>
                                        <button 
                                            onClick={() => handleCreateClaim(invoice.id)}
                                            disabled={processingClaim === invoice.id}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md disabled:bg-gray-400"
                                        >
                                            {processingClaim === invoice.id ? 'Submitting...' : 'Submit e-Claim'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Claims */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Insurance Claims</h3>
                     <div className="bg-white shadow rounded-lg divide-y">
                        {claims.map(claim => (
                            <div key={claim.id} className="p-3 text-sm flex justify-between items-center">
                                <div>
                                    <p>Tracking #: <span className="font-mono">{claim.trackingNumber}</span></p>
                                    <p className="text-xs text-gray-500">Submitted: {claim.submissionDate.toLocaleDateString()}</p>
                                </div>
                                <span className="capitalize text-xs font-semibold">{claim.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SettingsPanel>
    );
};

export default PatientBillingPage;