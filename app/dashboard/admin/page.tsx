import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Super Admin Control Center</h1>
        <div className="text-sm text-slate-500">Platform · Tenants · Global Controls</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Tenants</h3>
          <div className="text-2xl font-bold mt-2">128</div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">AI Token Quota (Global)</h3>
          <div className="text-2xl font-bold mt-2">12,000 / mo</div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Active Subscriptions</h3>
          <div className="text-2xl font-bold mt-2">94</div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">System Health</h3>
          <div className="text-2xl font-bold mt-2">OK</div>
        </div>
      </section>

      <section className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
        <h3 className="text-lg font-medium">Tenant Management</h3>
        <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">Create, disable, or edit tenants. Configure quotas and subscription plans here.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Revenue Overview</h3>
          <div className="mt-3 text-2xl font-bold">$212,430</div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h3 className="text-sm text-slate-400">Deployment / Vercel</h3>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">Auto-triggered on pushes to main. Monitor builds in Vercel.</p>
        </div>
      </section>
    </div>
  );
}
