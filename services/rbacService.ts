import { UserRole } from '../types';

type Permission =
    | 'dashboard:read'
    | 'profile:read'
    | 'profile:write'
    | 'users:read'
    | 'users:write'
    | 'inventory:read'
    | 'inventory:write'
    | 'appointments:read'
    | 'appointments:write'
    | 'patients:read'
    | 'patients:write'
    | 'billing:read'
    | 'billing:write'
    | 'nhs:read'
    | 'nhs:write'
    | 'quality:read'
    | 'quality:write'
    | 'compliance:read'
    | 'compliance:write'
    | 'tasks:read'
    | 'tasks:write'
    | 'reports:read'
    | 'notifications:configure'
    | 'tenant:billing'
    | 'practice:locations:read'
    | 'practice:locations:write'
    | 'rota:read'
    | 'rota:write'
    | 'rota:publish'
    | 'security:read'
    | 'security:write'
    | 'data:manage'
    | 'tenant:customize';

const roles: Record<UserRole, Permission[]> = {
    Admin: [
        'dashboard:read', 'profile:read', 'profile:write', 'users:read', 'users:write',
        'inventory:read', 'inventory:write', 'appointments:read', 'appointments:write',
        'patients:read', 'patients:write', 'billing:read', 'billing:write',
        'nhs:read', 'nhs:write', 'quality:read', 'quality:write',
        'compliance:read', 'compliance:write', 'tasks:read', 'tasks:write',
        'reports:read', 'notifications:configure', 'tenant:billing', 'practice:locations:read', 'practice:locations:write',
        'rota:read', 'rota:write', 'rota:publish',
        'security:read', 'security:write', 'data:manage', 'tenant:customize'
    ],
    Manager: [
        'dashboard:read', 'profile:read', 'profile:write', 'users:read', 'users:write',
        'inventory:read', 'inventory:write', 'appointments:read', 'appointments:write',
        'patients:read', 'quality:read', 'quality:write', 'compliance:read', 'compliance:write',
        'tasks:read', 'tasks:write', 'reports:read', 'notifications:configure', 'practice:locations:read', 'practice:locations:write',
        'rota:read', 'rota:write', 'rota:publish'
    ],
    Dentist: [
        'dashboard:read', 'profile:read', 'profile:write', 'inventory:read',
        'appointments:read', 'patients:read', 'patients:write', 'quality:read', 'tasks:read', 'rota:read'
    ],
    Hygienist: [
        'dashboard:read', 'profile:read', 'profile:write', 'inventory:read',
        'appointments:read', 'patients:read', 'patients:write', 'tasks:read', 'rota:read'
    ],
    Receptionist: [
        'dashboard:read', 'profile:read', 'profile:write', 'appointments:read', 'appointments:write',
        'patients:read', 'billing:read', 'tasks:read', 'rota:read'
    ],
    ComplianceLead: [
        'dashboard:read', 'profile:read', 'profile:write', 'compliance:read', 'compliance:write',
        'quality:read', 'tasks:read', 'tasks:write', 'rota:read'
    ],
    PracticeManager: [
        'dashboard:read', 'profile:read', 'profile:write', 'users:read', 'users:write',
        'inventory:read', 'inventory:write', 'appointments:read', 'appointments:write',
        'patients:read', 'quality:read', 'quality:write', 'compliance:read', 'compliance:write',
        'tasks:read', 'tasks:write', 'reports:read', 'notifications:configure', 'practice:locations:read', 'practice:locations:write',
        'rota:read', 'rota:write'
    ]
};

export const rbacService = {
    can: (role: UserRole, permission: Permission): boolean => {
        return roles[role]?.includes(permission) || false;
    },
    getPermissionsForRole: (role: UserRole): Permission[] => {
        return roles[role] || [];
    }
};