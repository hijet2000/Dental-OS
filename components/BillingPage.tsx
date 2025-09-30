

import React, { FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useApp } from '../hooks/useApp';
import { useNotifications } from './Notification';
import { billingService } from '../services/billingService';
// Fix: Corrected import path
import { SubscriptionPlan } from '../types';

const BillingPage: FC = () => {
    const { subscriptionPlan, setSubscriptionPlan } = useApp();
    const { addNotification } = useNotifications();
    const planDetails = billingService.getPlanDetails();

    const handlePlanChange = (plan: SubscriptionPlan) => {
        setSubscriptionPlan(plan);
        addNotification({ type: 'success', message: `Successfully changed to the ${plan} plan.` });
    };

    const handlePaymentFailure = () => {
        billingService.simulatePaymentFailure();
        addNotification({ type: 'info', message: 'Simulated payment failure notification has been triggered.' });
    };

    return (
        <SettingsPanel title="Billing & Subscription">
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 text-center">Choose the plan that's right for you</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {(Object.keys(planDetails) as SubscriptionPlan[]).map(plan => {
                            const details = planDetails[plan];
                            const isCurrent = plan === subscriptionPlan;
                            return (
                                <div key={plan} className={`border rounded-lg p-6 flex flex-col ${isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'}`}>
                                    <h4 className="text-2xl font-bold text-center">{plan}</h4>
                                    <p className="text-4xl font-extrabold text-center my-4">{details.price}<span className="text-base font-medium text-gray-500">/mo</span></p>
                                    <ul className="space-y-3 text-sm flex-1">
                                        {details.features.map(feature => (
                                            <li key={feature.name} className="flex items-center">
                                                <svg className={`w-5 h-5 mr-2 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className={!feature.included ? 'text-gray-400' : ''}>{feature.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handlePlanChange(plan)}
                                        disabled={isCurrent}
                                        className={`mt-6 w-full py-2 px-4 rounded-md font-semibold ${isCurrent ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                    >
                                        {isCurrent ? 'Current Plan' : 'Choose Plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Billing Actions</h3>
                    <p className="text-sm text-gray-500 mb-4">These actions are for testing and simulation purposes.</p>
                    <button onClick={handlePaymentFailure} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg">
                        Simulate Payment Failure
                    </button>
                </div>
            </div>
        </SettingsPanel>
    );
};

export default BillingPage;