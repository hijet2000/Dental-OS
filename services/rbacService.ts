
import { UserRole, PermissionKey } from '../types';
import { ROLES_CONFIG } from '../constants';

export const hasPermission = (role: UserRole, permission: PermissionKey): boolean => {
    const roleConfig = ROLES_CONFIG[role];
    if (!roleConfig) {
        return false;
    }
    return roleConfig.permissions.has(permission);
};
