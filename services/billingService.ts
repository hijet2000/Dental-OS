// Fix: Corrected import path
import { SubscriptionPlan, PlanFeature } from '../types';
// Fix: Corrected import path
import { notificationRuleEngineService } from './notificationRuleEngineService';

const PLAN_FEATURES: { name: string, tiers: { Basic: boolean, Pro: boolean, Enterprise: boolean } }[] = [
    // --- Basic Plan Features ---
    { name: 'Patient Clinical Records', tiers: { Basic: true, Pro: true, Enterprise: true } },
    { name: 'Appointment Scheduling', tiers: { Basic: true, Pro: true, Enterprise: true } },
    { name: 'Staff Management', tiers: { Basic: true, Pro: true, Enterprise: true } },
    { name: 'Single Location Rota', tiers: { Basic: true, Pro: true, Enterprise: true } },
    { name: 'In-App Notifications', tiers: { Basic: true, Pro: true, Enterprise: true } },
    { name: 'Task Performance (QR Scan)', tiers: { Basic: true, Pro: true, Enterprise: true } },

    // --- Pro Plan Features (Includes Basic) ---
    { name: 'Multi-Location Management (up to 3)', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Multi-Location Rota & Publishing', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Task Verification & Scoring', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Task SLA Alerts & Escalation', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Inventory Management', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Standard Reporting', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Quality & Lab Management', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Compliance Management', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Patient Private Billing', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'All AI Features', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Custom Branding', tiers: { Basic: false, Pro: true, Enterprise: true } },
    { name: 'Email & SMS Notifications', tiers: { Basic: false, Pro: true, Enterprise: true } },

    // --- Enterprise Plan Features (Includes Pro) ---
    { name: 'Unlimited Locations', tiers: { Basic: false, Pro: false, Enterprise: true } },
    { name: 'Advanced Rota Constraints', tiers: { Basic: false, Pro: false, Enterprise: true } },
    { name: 'Task Leaderboards & Advanced Reports', tiers: { Basic: false, Pro: false, Enterprise: true } },
    { name: 'NHS Management Module', tiers: { Basic: false, Pro: false, Enterprise: true } },
    { name: 'Data Management (Import/Export)', tiers: { Basic: false, Pro: false, Enterprise: true } },
    { name: 'Advanced Security (IP Allowlist)', tiers: { Basic: false, Pro: false, Enterprise: true } },
    { name: 'Advanced Audit Logs', tiers: { Basic: false, Pro: false, Enterprise: true } },
];


const PLAN_DETAILS: Record<SubscriptionPlan, { price: string, features: PlanFeature[] }> = {
    Basic: {
        price: '$49',
        features: PLAN_FEATURES.map(f => ({ name: f.name, included: f.tiers.Basic })),
    },
    Pro: {
        price: '$99',
        features: PLAN_FEATURES.map(f => ({ name: f.name, included: f.tiers.Pro })),
    },
    Enterprise: {
        price: 'Custom',
        features: PLAN_FEATURES.map(f => ({ name: f.name, included: f.tiers.Enterprise })),
    },
};

export const billingService = {
    /**
     * Retrieves the details for all subscription plans.
     * @returns An object containing the price and feature list for each plan.
     */
    getPlanDetails: (): Record<SubscriptionPlan, { price: string, features: PlanFeature[] }> => {
        return PLAN_DETAILS;
    },

    /**
     * Simulates a failed payment and triggers the corresponding notification.
     * This allows admins to test the payment failure alert workflow.
     */
    simulatePaymentFailure: (): void => {
        console.log('[BillingService] Simulating a failed subscription payment...');
        notificationRuleEngineService.processEvent('PAYMENT_FAILURE', {});
    },
};