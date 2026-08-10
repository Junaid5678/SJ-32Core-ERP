// Central RBAC mapping for SJ ERP

export type Role =
  | "SUPER_ADMIN"
  | "COMPANY_OWNER"
  | "ADMIN"
  | "MANAGER"
  | "ACCOUNTANT"
  | "STAFF"
  | "GUEST";

// Permission keys are arbitrary strings mapped across UI & API checks
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: [
    "*",
  ],
  COMPANY_OWNER: [
    "dashboard.view",
    "branches.view",
    "financials.view",
    "ledger.access",
    "inventory.access",
    "pos.access",
    "crm.access",
    "hrm.access",
    "procurement.access",
    "mrp.access",
  ],
  ADMIN: [
    "dashboard.view",
    "branches.view",
    "ledger.access",
    "inventory.access",
    "pos.access",
    "crm.access",
    "hrm.access",
    "procurement.access",
    "mrp.access",
  ],
  MANAGER: [
    "dashboard.view",
    "inventory.access",
    "pos.access",
    "crm.access",
  ],
  ACCOUNTANT: ["dashboard.view", "financials.view", "ledger.access"],
  STAFF: ["pos.access", "crm.access"],
  GUEST: [],
};

export function getPermissionsForRole(role: string | undefined): string[] {
  if (!role) return [];
  const r = role as Role;
  return ROLE_PERMISSIONS[r] || [];
}

export function hasPermission(role: string | undefined, permission: string): boolean {
  if (!role) return false;
  const perms = getPermissionsForRole(role);
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

// Placeholder: in your real app, replace this with server-side session tooling.
export async function getRoleFromSession(): Promise<string> {
  // Example: fetch from Supabase or your auth provider using cookies/session
  return "GUEST";
}
