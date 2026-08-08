'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function RbacStaffEngine({ userEmail }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Cashier');

  useEffect(() => {
    async function fetchStaff() {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('tenant_email', userEmail);

      if (!error && data) {
        setStaffList(data);
      }
    }
    if (userEmail) fetchStaff();
  }, [userEmail]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;
    setLoading(true);

    // Generate human-readable staff ID
    const staffId = `SJ-STF-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const { error } = await supabase.from('staff_members').insert([
        {
          tenant_email: userEmail,
          staff_name: staffName,
          staff_email: staffEmail,
          role: staffRole,
          staff_id: staffId
        }
      ]);

      if (error) throw error;

      alert('Staff member added successfully with ID: ' + staffId);
      setStaffName('');
      setStaffEmail('');

      const { data } = await supabase
        .from('staff_members')
        .select('*')
        .eq('tenant_email', userEmail);
      if (data) setStaffList(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-indigo-400">7-Tier RBAC & Human-Readable Staff ID Engine</h2>
          <p className="text-xs text-slate-400">Manage staff roles, permissions, and generate human-readable staff IDs.</p>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
          Engine #7 Active
        </span>
      </div>

      <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Staff Name"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <input
          type="email"
          placeholder="Staff Email"
          value={staffEmail}
          onChange={(e) => setStaffEmail(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <select
          value={staffRole}
          onChange={(e) => setStaffRole(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="Cashier">Tier 1: Cashier</option>
          <option value="Inventory Clerk">Tier 2: Inventory Clerk</option>
          <option value="Sales Executive">Tier 3: Sales Executive</option>
          <option value="Branch Supervisor">Tier 4: Branch Supervisor</option>
          <option value="Accountant">Tier 5: Accountant</option>
          <option value="General Manager">Tier 6: General Manager</option>
          <option value="Store Admin">Tier 7: Store Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
        >
          {loading ? 'Adding...' : 'Add Staff & Assign ID'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Staff ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">RBAC Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500">No staff members found.</td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-950/50">
                  <td className="p-3 font-mono text-indigo-300 font-bold">{staff.staff_id}</td>
                  <td className="p-3 text-white font-medium">{staff.staff_name}</td>
                  <td className="p-3 text-slate-400">{staff.staff_email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      {staff.role}
                    </span>
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

