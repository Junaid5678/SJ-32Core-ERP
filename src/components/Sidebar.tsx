"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPermissionsForRole, canAccessEngine } from "../lib/rbac";

const MODULES = [
  { key: "ledger", label: "Ledger & Accounts" },
  { key: "inventory", label: "Inventory & BOM" },
  { key: "pos", label: "POS & Orders" },
  { key: "logistics", label: "Logistics & Dispatch" },
  { key: "crm", label: "CRM & Customer Relations" },
  { key: "hrm", label: "HRM & Payroll" },
  { key: "procurement", label: "Procurement & PO" },
  { key: "mrp", label: "Manufacturing MRP" },
  { key: "sales", label: "Sales & Orders" },
  { key: "purchasing", label: "Purchasing & Suppliers" },
  { key: "reports", label: "Reports & Analytics" },
  { key: "settings", label: "System Settings" },
  { key: "manufacturing", label: "Manufacturing Floor" },
  { key: "quality", label: "Quality Control" },
  { key: "warehouse", label: "Warehouse Management" },
  { key: "fleet", label: "Fleet & Dispatch" },
  { key: "assets", label: "Fixed Assets" },
  { key: "payroll", label: "Payroll Processing" },
  { key: "timesheets", label: "Time & Attendance" },
  { key: "helpdesk", label: "Helpdesk & Tickets" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "banking", label: "Banking & Reconciliations" },
  { key: "projects", label: "Projects & Jobs" },
  { key: "contacts", label: "Contacts & CRM" },
  { key: "documents", label: "Documents & Records" },
  { key: "production", label: "Production Planning" },
  { key: "rma", label: "Returns & RMA" },
  { key: "pricing", label: "Pricing Engine" },
  { key: "integrations", label: "Integrations & API" },
  { key: "compliance", label: "Compliance & Audit" },
  { key: "analytics", label: "Advanced Analytics" },
];

function getClientRole(): string {
  try {
    return (localStorage.getItem('sj_role') as string) || 'GUEST';
  } catch (e) {
    return 'GUEST';
  }
}

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const [collapsed, setCollapsed] = useState(false);
  const role = getClientRole();
  const permissions = getPermissionsForRole(role);
  const [planMeta, setPlanMeta] = useState<any>(null);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('sj_plan_meta') || 'null');
      setPlanMeta(p);
    } catch (e) {
      setPlanMeta(null);
    }
  }, []);

  return (
    <aside className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-200 flex flex-col ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded flex items-center justify-center text-white font-bold">SJ</div>
          {!collapsed && <h2 className="text-lg font-semibold">SJ ERP</h2>}
        </div>
        <button aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)} className="text-slate-600 dark:text-slate-200 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{collapsed ? '→' : '←'}</button>
      </div>

      <nav className="flex-1 overflow-auto">
        <ul className="space-y-1 px-2">
          {MODULES.map((m) => {
            const route = `/dashboard/engines/${m.key}`;
            const active = pathname.startsWith(route);
            const allowed = permissions.includes(m.key + '.access') || permissions.includes('*') || permissions.includes(m.key) || permissions.includes('dashboard.view');
            const planAllows = canAccessEngine(role, m.key);
            const visible = allowed && planAllows;
            return (
              <li key={m.key}>
                {visible ? (
                  <Link href={route} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${active ? 'bg-indigo-50 dark:bg-indigo-700/30 text-indigo-700 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-200'}`}>
                    <span className="inline-block h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
                    {!collapsed && m.label}
                  </Link>
                ) : (
                  <div className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed`} title="You don't have access">
                    <span className="inline-block h-5 w-5 bg-slate-100 dark:bg-slate-700 rounded opacity-60" />
                    {!collapsed && m.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 sm:px-4 py-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">Role: {role}</div>
        <div className="mt-2 flex items-center gap-2">
          <Link href="/dashboard" className="text-sm px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100">Dashboard</Link>
          <Link href="/dashboard/admin" className="text-sm px-2 py-1 rounded bg-indigo-600 text-white">Admin</Link>
        </div>
      </div>
    </aside>
  );
}
