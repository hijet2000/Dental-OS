
import React, { useState, FC } from 'react';
import { SettingsPanel } from './SettingsPage';
import { useBranding } from '../hooks/useBranding';
import { useNotifications } from './Notification';
import { fileToBase64, getContrastRatio } from '../utils';

const BrandingPage: FC = () => {
    const { branding, setBranding } = useBranding();
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState(branding);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setFormData({ ...formData, [field]: `data:${file.type};base64,${base64}` });
        }
    };

    const handleSave = () => {
        setBranding(formData);
        addNotification({ type: 'success', message: 'Branding updated successfully.' });
    };
    
    const contrastRatio = getContrastRatio(formData.primaryColor, '#FFFFFF');

    return (
        <SettingsPanel title="Branding & Customization">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                        <input type="text" name="tenantName" value={formData.tenantName} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} className="mt-1 w-full text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Favicon</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'faviconUrl')} className="mt-1 w-full text-sm" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                            <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleInputChange} className="mt-1 w-full h-10" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                            <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleInputChange} className="mt-1 w-full h-10" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSave} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Save Branding</button>
                    </div>
                </div>
                {/* Preview */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h4 className="font-semibold text-center mb-4">Live Preview</h4>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: formData.primaryColor }}>
                            <div className="flex items-center mb-4">
                                <img src={formData.logoUrl} alt="logo" className="w-8 h-8 mr-2" />
                                <h2 className="text-lg font-bold" style={{ color: contrastRatio > 3 ? '#FFFFFF' : '#000000' }}>{formData.tenantName}</h2>
                            </div>
                            <button className="w-full py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: formData.secondaryColor, color: formData.primaryColor }}>
                                Example Button
                            </button>
                             <p className={`text-xs mt-2 text-center ${contrastRatio < 3 ? 'text-red-500 font-bold' : 'text-gray-200'}`}>
                                Contrast with white text: {contrastRatio.toFixed(2)}:1 {contrastRatio < 3 ? '(Low)' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsPanel>
    );
};

export default BrandingPage;
