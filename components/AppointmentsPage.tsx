

import React, { FC } from 'react';
import { SettingsPanel } from './SettingsPage';

const AppointmentsPage: FC = () => {
    return (
        <SettingsPanel title="Appointments">
            <div className="bg-white p-6 rounded-lg shadow">
                <p>Appointments calendar and management functionality will be implemented here.</p>
            </div>
        </SettingsPanel>
    );
};

export default AppointmentsPage;
