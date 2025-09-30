import { v4 as uuidv4 } from 'uuid';
import { MOCK_PROCEDURE_CODES, MOCK_PATIENT_INVOICES, MOCK_PATIENT_PAYMENTS, MOCK_INSURANCE_CLAIMS } from '../constants';
import { ProcedureCode, PatientInvoice, InvoiceItem, PatientPayment, InsuranceClaim } from '../types';
import { paymentGatewayService } from './paymentGatewayService';
import { eClaimsService } from './eClaimsService';

// In-memory store for demonstration
let procedureCodes: ProcedureCode[] = JSON.parse(JSON.stringify(MOCK_PROCEDURE_CODES));
let invoices: PatientInvoice[] = JSON.parse(JSON.stringify(MOCK_PATIENT_INVOICES)).map((i: any) => ({ ...i, date: new Date(i.date) }));
let payments: PatientPayment[] = JSON.parse(JSON.stringify(MOCK_PATIENT_PAYMENTS)).map((p: any) => ({ ...p, date: new Date(p.date) }));
let claims: InsuranceClaim[] = JSON.parse(JSON.stringify(MOCK_INSURANCE_CLAIMS)).map((c: any) => ({ ...c, submissionDate: new Date(c.submissionDate) }));

export const patientBillingService = {
    // --- Procedure Codes ---
    getProcedureCodes: (): ProcedureCode[] => [...procedureCodes],

    // --- Invoices ---
    getInvoicesForPatient: (patientId: string): PatientInvoice[] => {
        return invoices
            .filter(inv => inv.patientId === patientId)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    createInvoice: (patientId: string, items: InvoiceItem[]): PatientInvoice => {
        const total = items.reduce((sum, item) => sum + item.fee, 0);
        const newInvoice: PatientInvoice = {
            id: `inv-${uuidv4()}`,
            patientId,
            date: new Date(),
            items,
            total,
            amountPaid: 0,
            status: 'sent',
        };
        invoices.unshift(newInvoice);
        return newInvoice;
    },

    // --- Payments ---
    getPaymentsForPatient: (patientId: string): PatientPayment[] => {
        return payments
            .filter(p => p.patientId === patientId)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    recordPayment: async (
        patientId: string,
        invoiceId: string,
        amount: number,
        method: 'cash' | 'credit_card'
    ): Promise<PatientPayment> => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        let transactionId: string | undefined;
        if (method === 'credit_card') {
            const result = await paymentGatewayService.processPayment(amount, { cardNumber: '4242...', expiry: '12/25', cvv: '123'});
            if (!result.success) throw new Error("Payment gateway failed");
            transactionId = result.transactionId;
        }

        const newPayment: PatientPayment = {
            id: `pay-${uuidv4()}`,
            patientId,
            invoiceId,
            date: new Date(),
            amount,
            method,
            transactionId,
        };
        payments.unshift(newPayment);

        // Update invoice status
        invoice.amountPaid += amount;
        if (invoice.amountPaid >= invoice.total) {
            invoice.status = 'paid';
        }

        return newPayment;
    },

    // --- Claims ---
    getClaimsForPatient: (patientId: string): InsuranceClaim[] => {
        return claims
            .filter(c => c.patientId === patientId)
            .sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());
    },
    createClaim: async (invoiceId: string): Promise<InsuranceClaim> => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) throw new Error("Invoice not found");
        
        const result = await eClaimsService.submitClaim(invoice);
        if(!result.success) throw new Error("eClaims submission failed");

        const newClaim: InsuranceClaim = {
            id: `claim-${uuidv4()}`,
            invoiceId,
            patientId: invoice.patientId,
            submissionDate: new Date(),
            status: 'submitted',
            trackingNumber: result.trackingNumber,
            amountPaid: 0,
        };
        claims.unshift(newClaim);
        return newClaim;
    },
};
