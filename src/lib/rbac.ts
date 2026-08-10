// Central RBAC mapping for SJ ERP

export type Role =
  | 'SUPER_ADMIN'
  | 'COMPANY_OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'ACCOUNTANT'
  | 'STAFF'
  | 'GUEST';

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  COMPANY_OWNER: [
    'dashboard.view','branches.view','financials.view',
    'ledger.access','inventory.access','pos.access','crm.access','hrm.access','procurement.access','mrp.access','analytics.access'
  ],
  ADMIN: [
    'dashboard.view','branches.view','ledger.access','inventory.access','pos.access','crm.access','hrm.access','procurement.access','mrp.access'
  ],
  MANAGER: ['dashboard.view','inventory.access','pos.access','crm.access'],
  ACCOUNTANT: ['dashboard.view','financials.view','ledger.access'],
  STAFF: ['pos.access','crm.access'],
  GUEST: [],
};

export function getPermissionsForRole(role: string | undefined): string[]{
  if(!role) return [];
  const r = role as Role;
  return ROLE_PERMISSIONS[r] || [];
}

export function hasPermission(role: string | undefined, permission: string): boolean{
  if(!role) return false;
  const perms = getPermissionsForRole(role);
  if(perms.includes('*')) return true;
  return perms.includes(permission);
}

// Plan checking helpers (simple, client-side)
export function getPlanMeta(): any {
  try { return JSON.parse(localStorage.getItem('sj_plan_meta') || 'null'); } catch(e){ return null; }
}

export function canAccessEngine(role:string|undefined, engineKey:string): boolean{
  const perms = getPermissionsForRole(role);
  if(perms.includes('*')) return true;
  const plan = getPlanMeta();
  if(plan === 'enterprise') return true;
  if(plan && plan.allowed_engines && Array.isArray(plan.allowed_engines)){
    return plan.allowed_engines.includes(engineKey) && perms.some(p=>p.endsWith('.access') || p==='*');
  }
  // default: allow if role has explicit permission matching engineKey.access
  return perms.includes(`${engineKey}.access`);
}
