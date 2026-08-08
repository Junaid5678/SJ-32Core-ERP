'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AccountingLedgerEngine({ userEmail }) {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [entryType, setEntryType] = useState('debit');

  useEffect(() => {
    async function fetchLedger() {
      const { data, error } = await supabase
        .from('general_ledger')
        .select('*')
        .eq('tenant_email', userEmail)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLedgerEntries(data);
      }
    }
    if (userEmail) fetchLedger();
  }, [userEmail]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('general_ledger').insert([
        {
          tenant_email: userEmail,
          description,
          type: entryType,
          amount: parseFloat(amount)
        }
      ]);

      if (error) throw error;

      alert('Ledger entry added successfully!');
      setDescription('');
      setAmount('');
      
      const { data } = await supabase
        .from('general_ledger')
        .select('*')
        .eq('tenant_email', userEmail)
        .order('created_at', { ascending: false });
      if (data) setLedgerEntries(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = ledgerEntries.filter(i => i.type === 'debit').reduce((sum, i) => sum + i.amount, 0);
  const totalCredit = ledgerEntries.filter(i => i.type === 'credit').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-indigo-400">Double-Entry Accounting & Khata Ledger Engine</h2>
          <p className="text-xs text-slate-400">Manage daily financial transactions, debit/credit logs, and general ledger.</p>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
          Engine #6 Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Total Debit (Income/In)</p>
          <p className="text-lg font-bold text-emerald-400">Rs. {totalDebit.toLocaleString()}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Total Credit (Expense/Out)</p>
          <p className="text-lg font-bold text-rose-400">Rs. {totalCredit.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Description (e.g., Resin Sale)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 sm:col-span-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <select
          value={entryType}
          onChange={(e) => setEntryType(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="debit">Debit (In)</option>
          <option value="credit">Credit (Out)</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold py-2 rounded-lg transition shadow-md shadow-indigo-600/20 sm:col-span-4"
        >
          {loading ? 'Adding Entry...' : 'Add Ledger Entry'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {ledgerEntries.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500">No ledger entries found.</td>
              </tr>
            ) : (
              ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-950/50">
                  <td className="p-3 text-slate-400">{new Date(entry.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-white font-medium">{entry.description}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${entry.type === 'debit' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold ${entry.type === 'debit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rs. {entry.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
    }
