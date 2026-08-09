// Canonical engine registry for SJ 32Core ERP
export type EngineEntry = {
  slug: string;
  title: string;
  description?: string;
  defaultEnabled?: boolean;
  icon?: string;
};

export const ENGINES: EngineEntry[] = [
  { slug: 'inventory', title: 'Inventory & BOM', defaultEnabled: true },
  { slug: 'pos', title: 'POS & Orders', defaultEnabled: true },
  { slug: 'accounting', title: 'Accounting Ledger', defaultEnabled: true },
  { slug: 'rbac', title: 'RBAC & Staff', defaultEnabled: true },
  { slug: 'logistics', title: 'Logistics', defaultEnabled: true },
  { slug: 'crm', title: 'CRM', defaultEnabled: true },
  { slug: 'hr', title: 'HR & Payroll', defaultEnabled: false },
  { slug: 'manufacturing', title: 'Manufacturing', defaultEnabled: false },
  { slug: 'purchasing', title: 'Purchasing', defaultEnabled: false },
  { slug: 'warehouse', title: 'Warehouse', defaultEnabled: false },
  { slug: 'reports', title: 'Reports & Analytics', defaultEnabled: true },
  { slug: 'settings', title: 'Company Settings', defaultEnabled: true },
  { slug: 'invoicing', title: 'Invoicing', defaultEnabled: false },
  { slug: 'payments', title: 'Payments', defaultEnabled: false },
  { slug: 'marketing', title: 'Marketing', defaultEnabled: false },
  { slug: 'support', title: 'Support / Tickets', defaultEnabled: false },
  { slug: 'ecommerce', title: 'E-Commerce', defaultEnabled: false },
  { slug: 'subscriptions', title: 'Subscriptions', defaultEnabled: true },
  { slug: 'analytics', title: 'Analytics', defaultEnabled: true },
  { slug: 'scheduler', title: 'Scheduler', defaultEnabled: false },
  { slug: 'documents', title: 'Documents', defaultEnabled: false },
  { slug: 'notifications', title: 'Notifications', defaultEnabled: true },
  { slug: 'chat', title: 'Chat Assistant', defaultEnabled: true },
  { slug: 'ai_tools', title: 'AI Tools', defaultEnabled: true },
  { slug: 'quality', title: 'Quality Control', defaultEnabled: false },
  { slug: 'assets', title: 'Fixed Assets', defaultEnabled: false },
  { slug: 'compliance', title: 'Compliance', defaultEnabled: false },
  { slug: 'integrations', title: 'Integrations', defaultEnabled: true },
  { slug: 'imports', title: 'Data Import / Export', defaultEnabled: true },
  { slug: 'audit', title: 'Audit Log', defaultEnabled: true },
  { slug: 'custom', title: 'Custom Engine', defaultEnabled: false },
];
