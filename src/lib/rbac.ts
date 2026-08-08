// Lightweight RBAC helpers for client-side checks. Server-side enforcement still required.
export type Role = 'superadmin' | 'owner' | 'admin' | 'manager' | 'finance' | 'sales' | 'warehouse' | 'user';

export function hasRole(userRoles: Role[] = [], required: Role | Role[]) {
  if (!Array.isArray(required)) required = [required];
  return required.some(r => userRoles.includes(r));
}

export function hasPermission(permissions: string[] = [], required: string | string[]) {
  if (!Array.isArray(required)) required = [required];
  return required.some(p => permissions.includes(p));
}

// Hook-like helper for quickly checking permissions in components
export function checkPermission(user: { roles?: Role[]; permissions?: string[] } | null, required: string | string[] | Role | Role[]) {
  if (!user) return false;
  if (typeof required === 'string' && required.includes('.')) {
    return hasPermission(user.permissions ?? [], required as string | string[]);
  }
  return hasRole(user.roles ?? [], required as Role | Role[]);
}
