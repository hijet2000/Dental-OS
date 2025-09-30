
import { PatientInvoice, PatientPayment, InsuranceClaim } from '../types';
import { paymentGatewayService } from './paymentGatewayService';
import { eClaimsService } from './eClaimsService';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demonstration
let invoices: PatientInvoice[] = [
    { id: 'inv-1', patientId: 'pat-1', date: new Date(Date.now() - 86400000 * 10), dueDate: new Date(Date.now() + 86400000 * 20), total: 150.00, amountPaid: 0, status: 'sent', items: [{ description: 'Crown Fitting', quantity: 1, unitPrice: 150 }] },
    { id: 'inv-2', patientId: 'pat-2', date: new Date(Date.now() - 86400000 * 40), dueDate: new Date(Date.now() - 86400000 * 10), total: 75.50, amountPaid: 0, status: 'overdue', items: [{ description: 'Hygiene Visit', quantity: 1, unitPrice: 75.50 }] },
    { id: 'inv-3', patientId: 'pat-1', date: new Date(Date.now() - 86400000 * 180), dueDate: new Date(Date.now() - 86400000 * 150), total: 90.00, amountPaid: 90.00, status: 'paid', items: [{ description: 'Check-up & X-ray', quantity: 1, unitPrice: 90.00 }] }
];
let payments: PatientPayment[] = [];
let claims: InsuranceClaim[] = [];


export const patientBillingService = {
    getInvoicesForPatient: (patientId: string): PatientInvoice[] => {
        return invoices.filter(i => i.patientId === patientId).sort((a,b) => b.date.getTime() - a.date.getTime());
    },
    getPaymentsForPatient: (patientId: string): PatientPayment[] => {
        return payments.filter(p => p.patientId === patientId);
    },
    getClaimsForPatient: (patientId: string): InsuranceClaim[] => {
        const patientInvoices = invoices.filter(i => i.patientId === patientId).map(i => i.id);
        return claims.filter(c => patientInvoices.includes(c.invoiceId));
    },

    recordPayment: async (patientId: string, invoiceId: string, amount: number, method: 'credit_card' | 'cash'): Promise<PatientPayment> => {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        if (method === 'credit_card') {
            const paymentResult = await paymentGatewayService.processPayment(amount, { cardNumber: 'xxxx', expiry: 'xx/xx', cvv: 'xxx'});
            if (!paymentResult.success) {
                throw new Error(paymentResult.message);
            }
        }

        const newPayment: PatientPayment = {
            id: `pay-${uuidv4()}`,
            patientId,
            invoiceId,
            date: new Date(),
            amount,
            method,
        };
        payments.push(newPayment);

        invoice.amountPaid += amount;
        if (invoice.amountPaid >= invoice.total) {
            invoice.status = 'paid';
        }

        return newPayment;
    },

    createClaim: async (invoiceId: string): Promise<InsuranceClaim> => {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        const result = await eClaimsService.submitClaim(invoice);
        if (!result.success) throw new Error(result.message);

        const newClaim: InsuranceClaim = {
            id: `claim-${uuidv4()}`,
            invoiceId,
            submissionDate: new Date(),
            status: 'submitted',
            trackingNumber: result.trackingNumber
        };
        claims.push(newClaim);
        return newClaim;
    },
};