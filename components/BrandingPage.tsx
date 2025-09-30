
import React, { useState, FC, useMemo } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useBranding } from '../hooks/useBranding';
import { useNotifications } from './Notification';
// Fix: Corrected import path
import { TenantBranding } from '../types';
import { getContrastRatio } from '../utils';

const FormSection: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            <div className="mt-5 space-y-4">{children}</div>
        </div>
    </div>
);

const PreviewPane: FC<{ settings: TenantBranding }> = ({ settings }) => {
    return (
        <div className="bg-gray-100 p-6 rounded-lg sticky top-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Live Preview</h3>
            <div className={`p-4 rounded-lg border-2 border-dashed ${settings.defaultTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                style={{
                    // @ts-ignore
                    '--brand-primary': settings.primaryColor,
                    '--brand-secondary': settings.secondaryColor
                }}
            >
                <div className="flex items-center space-x-3 mb-4">
                    <img src={settings.logoUrl} alt="Logo Preview" className="h-10 w-10 object-contain bg-gray-200 rounded-full" />
                    <h2 className="text-xl font-bold">{settings.tenantName}</h2>
                </div>
                <p className="text-sm mb-4">This is a preview of your branding. The changes will apply to the entire application upon saving.</p>
                <div className="space-y-2">
                    <button className="w-full text-white font-bold py-2 px-4 rounded" style={{ backgroundColor: settings.primaryColor }}>
                        Primary Button
                    </button>
                    <button className="w-full text-white font-bold py-2 px-4 rounded" style={{ backgroundColor: settings.secondaryColor }}>
                        Secondary Button
                    </button>
                    <div className="text-center text-sm" style={{ color: settings.primaryColor }}>
                        This is text in your primary color.
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContrastChecker: FC<{ color: string }> = ({ color }) => {
    const whiteContrast = useMemo(() => getContrastRatio(color, '#FFFFFF'), [color]);
    const blackContrast = useMemo(() => getContrastRatio(color, '#000000'), [color]);
    const WCAG_AA_RATIO = 4.5;

    const whitePass = whiteContrast >= WCAG_AA_RATIO;
    const blackPass = blackContrast >= WCAG_AA_RATIO;

    return (
        <div className="text-xs space-y-1 mt-1 p-2 bg-gray-50 rounded-md">
            <div className={`flex justify-between items-center ${whitePass ? 'text-green-700' : 'text-red-700'}`}>
                <span>Contrast with white text: <strong>{whiteContrast.toFixed(2)}:1</strong></span>
                <span className="font-bold">{whitePass ? 'PASS' : 'FAIL'}</span>
            </div>
            <div className={`flex justify-between items-center ${blackPass ? 'text-green-700' : 'text-red-700'}`}>
                <span>Contrast with black text: <strong>{blackContrast.toFixed(2)}:1</strong></span>
                <span className="font-bold">{blackPass ? 'PASS' : 'FAIL'}</span>
            </div>
        </div>
    );
};


const BrandingPage: FC = () => {
    const { branding, setBranding } = useBranding();
    const { addNotification } = useNotifications();

    const [previewSettings, setPreviewSettings] = useState<TenantBranding>(branding);

    const handleInputChange = (field: keyof TenantBranding, value: string) => {
        setPreviewSettings(prev => ({ ...prev, [field]: value }));
    };
    
    const handleReset = () => {
        setPreviewSettings(branding);
        addNotification({type: 'info', message: 'Changes have been reset.'});
    }

    const handleSave = () => {
        setBranding(previewSettings);
        addNotification({type: 'success', message: 'Branding settings have been saved.'});
    }

    return (
        <SettingsPanel title="Branding & Appearance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <FormSection title="General">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                            <input type="text" value={previewSettings.tenantName} onChange={e => handleInputChange('tenantName', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                            <input type="text" value={previewSettings.logoUrl} onChange={e => handleInputChange('logoUrl', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Favicon URL</label>
                            <input type="text" value={previewSettings.faviconUrl} onChange={e => handleInputChange('faviconUrl', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="https://..." />
                        </div>
                    </FormSection>

                    <FormSection title="Color Palette">
                        <p className="text-sm text-gray-500">Choose colors that meet WCAG AA accessibility standards (a contrast ratio of 4.5:1 or higher) for text.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                                <div className="flex items-center space-x-2">
                                    <input type="color" value={previewSettings.primaryColor} onChange={e => handleInputChange('primaryColor', e.target.value)} className="w-10 h-10" />
                                    <input type="text" value={previewSettings.primaryColor} onChange={e => handleInputChange('primaryColor', e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                <ContrastChecker color={previewSettings.primaryColor} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                                <div className="flex items-center space-x-2">
                                    <input type="color" value={previewSettings.secondaryColor} onChange={e => handleInputChange('secondaryColor', e.target.value)} className="w-10 h-10" />
                                    <input type="text" value={previewSettings.secondaryColor} onChange={e => handleInputChange('secondaryColor', e.target.value)} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                <ContrastChecker color={previewSettings.secondaryColor} />
                            </div>
                        </div>
                    </FormSection>
                    
                    <FormSection title="Theme">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Default Theme</label>
                            <fieldset className="mt-2">
                                <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                    <div className="flex items-center">
                                        <input id="light" name="theme" type="radio" checked={previewSettings.defaultTheme === 'light'} onChange={() => handleInputChange('defaultTheme', 'light')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/>
                                        <label htmlFor="light" className="ml-3 block text-sm font-medium text-gray-700">Light</label>
                                    </div>
                                     <div className="flex items-center">
                                        <input id="dark" name="theme" type="radio" checked={previewSettings.defaultTheme === 'dark'} onChange={() => handleInputChange('defaultTheme', 'dark')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/>
                                        <label htmlFor="dark" className="ml-3 block text-sm font-medium text-gray-700">Dark</label>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </FormSection>

                    <FormSection title="PDF Branding">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">PDF Header</label>
                            <input type="text" value={previewSettings.pdfHeader} onChange={e => handleInputChange('pdfHeader', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">PDF Footer</label>
                            <input type="text" value={previewSettings.pdfFooter} onChange={e => handleInputChange('pdfFooter', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    </FormSection>
                    
                    <div className="flex justify-end space-x-3">
                         <button onClick={handleReset} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Reset</button>
                         <button onClick={handleSave} style={{backgroundColor: branding.primaryColor}} className="text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium">Save Changes</button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <PreviewPane settings={previewSettings} />
                </div>
            </div>
        </SettingsPanel>
    );
};

export default BrandingPage;