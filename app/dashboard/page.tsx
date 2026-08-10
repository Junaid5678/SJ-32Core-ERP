import React from "react";

export default function CompanyDashboard() {
  // This is a server/client hybrid placeholder. In production, wire to Supabase with tenant RLS.
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Company Owner Dashboard</h1>
        <div className="text-sm text-slate-500">Multi-branch overview · Tenant isolated</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Active Branches</h3>
          <div className="text-2xl font-bold mt-2">3</div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Financial Summary (MTD)</h3>
          <div className="text-2xl font-bold mt-2">$124,320</div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Active Engine Shortcuts</h3>
          <div className="text-2xl font-bold mt-2">Ledger · Inventory · POS</div>
        </div>
      </section>

      <section className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
        <h3 className="text-lg font-medium">Recent Branch Activities</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>Branch A · New Purchase Order created · 2h ago</li>
          <li>Branch B · Stock adjustment (SKU: ABC123) · 3h ago</li>
          <li>Branch C · Payroll run completed · 1d ago</li>
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Quick Actions</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Create Branch</button>
            <button className="px-3 py-1 rounded bg-emerald-500 text-white text-sm">Allocate AI Tokens</button>
            <button className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-sm">View Financials</button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Tenant Isolation</h3>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">All data shown here is tenant-isolated through Supabase RLS on tenant_email.</p>
        </div>
      </section>
    </div>
  );
}
