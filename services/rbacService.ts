import { UserRole } from '../types';

type Permission = 'view:dashboard' | 'manage:staff' | 'manage:billing' | 'manage:ai_features' | 'perform:clinical_tasks';

const rolePermissions: Record<UserRole, Permission[]> = {
    Admin: ['view:dashboard', 'manage:staff', 'manage:billing', 'manage:ai_features', 'perform:clinical_tasks'],
    Manager: ['view:dashboard', 'manage:staff', 'manage:ai_features'],
    Dentist: ['view:dashboard', 'perform:clinical_tasks'],
    Hygienist: ['view:dashboard', 'perform:clinical_tasks'],
    Receptionist: ['view:dashboard'],
    ComplianceLead: ['view:dashboard'],
};

export const rbacService = {
    getPermissionsForRole: (role: UserRole): Permission[] => {
        return rolePermissions[role] || [];
    },
};
