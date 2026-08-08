import React from 'react';

export default function ShipmentCard({ shipment }: { shipment: any }) {
  return (
    <article className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-100 break-words">{shipment.reference ?? '—'}</h3>
        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-200">{shipment.status}</span>
      </div>

      <div className="text-xs text-slate-300">
        <div><strong className="text-slate-100">From:</strong> <span className="break-all">{shipment.origin}</span></div>
        <div><strong className="text-slate-100">To:</strong> <span className="break-all">{shipment.destination}</span></div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{new Date(shipment.updated_at).toLocaleString()}</span>
        <button className="text-indigo-300 hover:text-indigo-200 text-sm">View</button>
      </div>
    </article>
  );
}
