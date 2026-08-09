'use client';

import React, { useEffect, useState } from 'react';
import EngineShell from '../_engineShell';
import { supabase } from '../../../../src/lib/supabaseClient';
import { requireTenantEmailOrThrow } from '../../../../src/lib/tenant';
import ShipmentCard from './components/ShipmentCard';

export default function LogisticsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantEmail, setTenantEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const email = await requireTenantEmailOrThrow();
        setTenantEmail(email);
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('tenant_email', email)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Supabase error', error);
          return;
        }
        setShipments(data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <EngineShell title="Logistics" subtitle="Shipments, deliveries and transfer orders" accent="emerald" actions={
      <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-3 py-2 rounded text-sm">New Shipment</button>
    }>
      <section>
        <div className="mb-3 text-sm text-slate-300">Tenant: <span className="font-medium">{tenantEmail ?? '—'}</span></div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading shipments...</div>
        ) : (
          <>
            {shipments.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No shipments found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shipments.map((s: any) => (
                  <ShipmentCard key={s.id} shipment={s} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-6">
        <div className="overflow-x-auto rounded-md border border-slate-800">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-850">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-slate-300">Ref</th>
                <th className="px-3 py-2 text-left text-xs text-slate-300">Status</th>
                <th className="px-3 py-2 text-left text-xs text-slate-300">Origin</th>
                <th className="px-3 py-2 text-left text-xs text-slate-300">Destination</th>
                <th className="px-3 py-2 text-left text-xs text-slate-300">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shipments.map(s => (
                <tr key={s.id} className="even:bg-slate-900">
                  <td className="px-3 py-2 text-sm break-all">{s.reference}</td>
                  <td className="px-3 py-2 text-sm">{s.status}</td>
                  <td className="px-3 py-2 text-sm">{s.origin}</td>
                  <td className="px-3 py-2 text-sm">{s.destination}</td>
                  <td className="px-3 py-2 text-sm">{new Date(s.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </EngineShell>
  );
}
