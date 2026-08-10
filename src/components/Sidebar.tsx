"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPermissionsForRole } from "../lib/rbac";

const MODULES = [
  { key: "ledger", label: "Ledger & Accounts", route: "/ledger", perm: "ledger.access" },
  { key: "inventory", label: "Inventory & BOM", route: "/inventory", perm: "inventory.access" },
  { key: "pos", label: "POS & Orders", route: "/pos", perm: "pos.access" },
  { key: "logistics", label: "Logistics & Dispatch", route: "/logistics", perm: "logistics.access" },
  { key: "crm", label: "CRM & Customer Relations", route: "/crm", perm: "crm.access" },
  { key: "hrm", label: "HRM & Payroll", route: "/hrm", perm: "hrm.access" },
  { key: "procurement", label: "Procurement & PO", route: "/procurement", perm: "procurement.access" },
  { key: "mrp", label: "Manufacturing MRP", route: "/mrp", perm: "mrp.access" },
];

// NOTE: In a real app, the user's role & tenant would be provided by server session / Supabase.
// Here we conservatively read from localStorage/session (if set) or default to GUEST for client rendering.
function getClientRole(): string {
  try {
    return (localStorage.getItem("sj_role") as string) || "GUEST";
  } catch (e) {
    return "GUEST";
  }
}

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const [collapsed, setCollapsed] = useState(false);
  const role = getClientRole();
  const permissions = getPermissionsForRole(role);

  return (
    <aside
      className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-200 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded flex items-center justify-center text-white font-bold">SJ</div>
          {!collapsed && <h2 className="text-lg font-semibold">SJ ERP</h2>}
        </div>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-600 dark:text-slate-200 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 overflow-auto">
        <ul className="space-y-1 px-2">
          {MODULES.map((m) => {
            const active = pathname.startsWith(m.route);
            const allowed = permissions.includes(m.perm);
            return (
              <li key={m.key}>
                {allowed ? (
                  <Link
                    href={m.route}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      active
                        ? "bg-indigo-50 dark:bg-indigo-700/30 text-indigo-700 dark:text-indigo-200"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="inline-block h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
                    {!collapsed && m.label}
                  </Link>
                ) : (
                  <div
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed`}
                    title="You don't have access"
                  >
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
