import React, { FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useApp } from '../hooks/useApp';
import { billingService } from '../services/billingService';
import { SubscriptionPlan } from '../types';

const PlanCatalogPage: FC = () => {
    const { subscriptionPlan } = useApp();
    const planDetails = billingService.getPlanDetails();

    return (
        <SettingsPanel title="Subscription Plans & Features">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-center">Compare Plans</h3>
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
                                {isCurrent && (
                                    <div className="mt-6 w-full py-2 px-4 rounded-md font-semibold bg-gray-200 text-gray-500 text-center">
                                        Current Plan
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </SettingsPanel>
    );
};

export default PlanCatalogPage;