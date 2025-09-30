import React, { useState, FC, useMemo, useEffect } from 'react';
import { SettingsPanel } from './SettingsPage';
import { patientService } from '../services/patientService';
import { patientBillingService } from '../services/patientBillingService';
import { Patient, PatientInvoice, PatientPayment, InsuranceClaim, ProcedureCode, InvoiceItem } from '../types';
import { useNotifications } from './Notification';
import { useApp } from '../hooks/useApp';

// --- Modals ---

const NewInvoiceModal: FC<{ patient: Patient; onClose: () => void; onSave: (invoice: PatientInvoice) => void; }> = ({ patient, onClose, onSave }) => {
    const allCodes = useMemo(() => patientBillingService.getProcedureCodes(), []);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCodes = useMemo(() => {
        if (!searchTerm) return [];
        return allCodes.filter(c => 
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allCodes]);

    const addItem = (code: ProcedureCode) => {
        setItems(prev => [...prev, { procedureCode: code.code, description: code.description, fee: code.fee }]);
        setSearchTerm('');
    };
    
    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const total = useMemo(() => items.reduce((sum, item) => sum + item.fee, 0), [items]);

    const handleSave = () => {
        const newInvoice = patientBillingService.createInvoice(patient.id, items);
        onSave(newInvoice);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">New Invoice for {patient.name}</h3>
                
                {/* Item Selection */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search for procedure code or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                    {filteredCodes.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto">
                            {filteredCodes.map(code => (
                                <li key={code.code} onClick={() => addItem(code)} className="p-2 hover:bg-indigo-100 cursor-pointer">
                                    {code.code} - {code.description} (${code.fee.toFixed(2)})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Invoice Items */}
                <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                    {items.length === 0 ? <p className="text-sm text-gray-500 text-center p-4">No items added.</p> : items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{item.procedureCode} - {item.description}</span>
                            <div className="flex items-center space-x-3">
                                <span>${item.fee.toFixed(2)}</span>
                                <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">&times;</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-right font-bold text-lg mt-4">Total: ${total.toFixed(2)}</div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} disabled={items.length === 0} className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">Save Invoice</button>
                </div>
            </div>
        </div>
    );
};

const RecordPaymentModal: FC<{ patient: Patient; invoices: PatientInvoice[]; onClose: () => void; onSave: (payment: PatientPayment) => void; }> = ({ patient, invoices, onClose, onSave }) => {
    const [invoiceId, setInvoiceId] = useState<string>(invoices.find(i => i.status !== 'paid')?.id || '');
    const [amount, setAmount] = useState<number>(0);
    const [method, setMethod] = useState<'cash' | 'credit_card'>('credit_card');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotifications();

    useEffect(() => {
        const selectedInvoice = invoices.find(i => i.id === invoiceId);
        if (selectedInvoice) {
            setAmount(selectedInvoice.total - selectedInvoice.amountPaid);
        }
    }, [invoiceId, invoices]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const newPayment = await patientBillingService.recordPayment(patient.id, invoiceId, amount, method);
            onSave(newPayment);
            onClose();
        } catch(error: any) {
            addNotification({ type: 'error', message: `Payment failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Record Payment for {patient.name}</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Select Invoice</label>
                        <select value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full p-2 border rounded-md">
                            {invoices.filter(i => i.status !== 'paid').map(i => <option key={i.id} value={i.id}>Invoice {i.id.slice(-6)} - Due: ${(i.total-i.amountPaid).toFixed(2)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                         <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full p-2 border rounded-md">
                            <option value="credit_card">Credit Card</option>
                            <option value="cash">Cash</option>
                         </select>
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} disabled={!invoiceId || amount <= 0 || isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">
                        {isLoading ? 'Processing...' : 'Record Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const PatientBillingPage: FC = () => {
    const { addNotification } = useNotifications();
    const [allPatients] = useState(() => patientService.getPatients());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('invoices');
    const [modal, setModal] = useState<'invoice' | 'payment' | 'claim' | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); // Used to force re-fetch of data
    
    const filteredPatients = useMemo(() => {
        return allPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allPatients, searchTerm]);

    const { invoices, payments, claims, balance } = useMemo(() => {
        if (!selectedPatient) return { invoices: [], payments: [], claims: [], balance: 0 };
        const inv = patientBillingService.getInvoicesForPatient(selectedPatient.id);
        const pay = patientBillingService.getPaymentsForPatient(selectedPatient.id);
        const clm = patientBillingService.getClaimsForPatient(selectedPatient.id);
        const bal = inv.reduce((sum, i) => sum + (i.total - i.amountPaid), 0);
        return { invoices: inv, payments: pay, claims: clm, balance: bal };
    }, [selectedPatient, refreshKey]);
    
    const handleCreateClaim = async (invoice: PatientInvoice) => {
        try {
            await patientBillingService.createClaim(invoice.id);
            addNotification({type: 'success', message: 'Insurance claim submitted successfully.'});
            setRefreshKey(k => k + 1);
        } catch (error: any) {
            addNotification({type: 'error', message: `Claim submission failed: ${error.message}`});
        }
    };

    return (
        <SettingsPanel title="Patient Billing">
            {modal === 'invoice' && selectedPatient && <NewInvoiceModal patient={selectedPatient} onClose={() => setModal(null)} onSave={() => { addNotification({type:'success', message:'Invoice created.'}); setRefreshKey(k => k+1); }} />}
            {modal === 'payment' && selectedPatient && <RecordPaymentModal patient={selectedPatient} invoices={invoices} onClose={() => setModal(null)} onSave={() => { addNotification({type:'success', message:'Payment recorded.'}); setRefreshKey(k => k+1); }} />}
            <div className="flex h-[calc(100vh-12rem)]">
                 <aside className="w-1/3 border-r pr-4 flex flex-col">
                    <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md mb-4"/>
                    <ul className="space-y-2 overflow-y-auto">
                        {filteredPatients.map(p => (
                            <li key={p.id}>
                                <button onClick={() => setSelectedPatient(p)} className={`w-full text-left p-3 rounded-md border flex items-center space-x-3 ${selectedPatient?.id === p.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white hover:bg-gray-50'}`}>
                                    <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full"/>
                                    <div><p className="font-semibold">{p.name}</p></div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="w-2/3 pl-4 flex flex-col">
                    {selectedPatient ? (
                        <div className="bg-white p-4 rounded-lg border flex-1 flex flex-col">
                           <div className="flex justify-between items-center pb-4 border-b">
                               <div className="flex items-center space-x-4">
                                   <img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className="w-16 h-16 rounded-full"/>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                                        <p className="text-lg text-red-600 font-semibold">Balance: ${balance.toFixed(2)}</p>
                                    </div>
                               </div>
                               <div className="space-x-2">
                                   <button onClick={() => setModal('invoice')} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm">New Invoice</button>
                                   <button onClick={() => setModal('payment')} disabled={balance <= 0} className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm disabled:bg-gray-400">Record Payment</button>
                               </div>
                           </div>
                           <div className="border-b"><nav className="flex space-x-4" aria-label="Tabs">
                                <button onClick={() => setActiveTab('invoices')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'invoices' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Invoices ({invoices.length})</button>
                                <button onClick={() => setActiveTab('payments')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'payments' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Payments ({payments.length})</button>
                                <button onClick={() => setActiveTab('claims')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'claims' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Claims ({claims.length})</button>
                           </nav></div>
                           <div className="py-4 overflow-y-auto flex-1">
                                {activeTab === 'invoices' && <div>
                                    {invoices.map(inv => (
                                        <div key={inv.id} className="p-3 bg-gray-50 rounded-md border mb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">Invoice {inv.id.slice(-6)} - <span className="text-sm text-gray-500">{inv.date.toLocaleDateString()}</span></h4>
                                                    <ul className="text-xs list-disc list-inside ml-2">
                                                        {inv.items.map((it, idx) => <li key={idx}>{it.description} (${it.fee.toFixed(2)})</li>)}
                                                    </ul>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">${inv.total.toFixed(2)}</p>
                                                    <span className={`capitalize text-xs font-bold px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{inv.status}</span>
                                                    {inv.status !== 'paid' && <button onClick={() => handleCreateClaim(inv)} className="text-xs text-indigo-600 hover:underline mt-1 block">Submit Claim</button>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>}
                                {activeTab === 'payments' && <div>
                                    {payments.map(p => (
                                         <div key={p.id} className="p-3 bg-gray-50 rounded-md border mb-3">
                                             <p><strong>${p.amount.toFixed(2)}</strong> paid on {p.date.toLocaleDateString()} via {p.method}. {p.transactionId && `(Ref: ${p.transactionId})`}</p>
                                         </div>
                                    ))}
                                </div>}
                                {activeTab === 'claims' && <div>
                                      {claims.map(c => (
                                         <div key={c.id} className="p-3 bg-gray-50 rounded-md border mb-3">
                                             <p>Claim for Invoice {c.invoiceId.slice(-6)} submitted on {c.submissionDate.toLocaleDateString()}. Status: <span className="font-semibold">{c.status}</span>.</p>
                                             <p className="text-xs">Tracking #: {c.trackingNumber}</p>
                                         </div>
                                      ))}
                                </div>}
                           </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg"><p className="text-gray-500">Select a patient to view their billing record.</p></div>
                    )}
                </main>
            </div>
        </SettingsPanel>
    );
};

export default PatientBillingPage;
