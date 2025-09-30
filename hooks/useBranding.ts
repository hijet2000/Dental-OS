
import React, { createContext, useContext, useState, ReactNode, useLayoutEffect } from 'react';
// Fix: Corrected import path
import { TenantBranding } from '../types';

interface BrandingContextType {
    branding: TenantBranding;
    setBranding: (branding: TenantBranding) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const DEFAULT_BRANDING: TenantBranding = {
    tenantName: 'ClinicOS',
    logoUrl: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='.9em' font-size='90'%3e🦷%3c/text%3e%3c/svg%3e`,
    faviconUrl: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='.9em' font-size='90'%3e🦷%3c/text%3e%3c/svg%3e`,
    primaryColor: '#007A9E',
    secondaryColor: '#00B4D8',
    defaultTheme: 'light',
    pdfHeader: 'ClinicOS - Confidential Report',
    pdfFooter: 'Page [P] of [TP]',
};

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [branding, setBranding] = useState<TenantBranding>(() => {
        try {
            const savedBranding = localStorage.getItem('tenantBranding');
            return savedBranding ? JSON.parse(savedBranding) : DEFAULT_BRANDING;
        } catch {
            return DEFAULT_BRANDING;
        }
    });

    const handleSetBranding = (newBranding: TenantBranding) => {
        localStorage.setItem('tenantBranding', JSON.stringify(newBranding));
        setBranding(newBranding);
    };

    useLayoutEffect(() => {
        // Apply colors
        document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
        document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);

        // Apply theme
        if (branding.defaultTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply favicon
        const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
        if (favicon && branding.faviconUrl) {
            favicon.href = branding.faviconUrl;
        }
    }, [branding]);

    return React.createElement(BrandingContext.Provider, { value: { branding, setBranding: handleSetBranding } }, children);
};

export const useBranding = (): BrandingContextType => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
};