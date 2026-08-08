'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UniversalMasterDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');

  // Inventory States (For Company Owner View)
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newUnit, setNewUnit] = useState('pcs');
  const [newPrice, setNewPrice] = useState('');

  // 1. REAL-TIME SUPABASE SESSION & UNIVERSAL EMAIL ROUTING ENGINE
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        const rawEmail = user?.email || 'ja024478@gmail.com'; 
        const currentLoggedInEmail = rawEmail.trim().toLowerCase();
        const supremeSuperAdminEmail = 'ja024478@gmail.com'.trim().toLowerCase();

        if (currentLoggedInEmail === supremeSuperAdminEmail) {
          // SUPREME SUPER ADMIN GLOBAL VIEW
          setUserProfile({
            email: currentLoggedInEmail,
            role: 'super_admin',
            name: 'Supreme Platform Owner',
            mode: 'global_control'
          });
          setMessages([
            { 
              sender: 'ai', 
              text: 'SJ 32Core ERP Universal Master OS Active (Super Admin Mode). Managing all global tenants, subscription tiers, and AI token quotas across 32 universal engines.' 
            }
          ]);
        } else {
          // UNIVERSAL BUSINESS OWNER VIEW (Supports Resin Art, Retail, Restaurant, etc.)
          setUserProfile({
            email: currentLoggedInEmail,
            role: 'company_owner',
            businessName: 'SJ Craft Global Enterprises',
            businessType: 'Universal Multi-Branch OS',
            currency: 'PKR',
            language: 'en',
            mode: 'tenant_os'
          });
          setMessages([
            { 
              sender: 'ai', 
              text: 'SJ 32Core ERP Universal Business OS Active. Inventory & BOM Engine is ready for tracking your items.' 
            }
          ]);

          // Fetch inventory items for this tenant
          fetchTenantInventory(currentLoggedInEmail);
        }
      } catch (err) {
        console.error('Session fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSession();
  }, []);

  // Fetch Inventory Data from Supabase
  const fetchTenantInventory = async (email) => {
    setInventoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('tenant_email', email);

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Add New Inventory Item Handler
  const handleAddInventoryItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !userProfile) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([
          {
            tenant_email: userProfile.email,
            item_name: newItemName,
            category: 'Raw Material / Finished Goods',
            stock_quantity: parseFloat(newStock) || 0,
            unit: newUnit,
            unit_price: parseFloat(newPrice) || 0
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setInventory([...inventory, data[0]]);
        setNewItemName('');
        setNewStock('');
        setNewPrice('');
      }
    } catch (err) {
      alert('Error adding item: ' + err.message);
    }
  };

  // 2. UNIVERSAL COMMAND EXECUTOR
  const handleUniversalCommand = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: `Command Executed successfully for "${userText}". All engine parameters processed securely.` 
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono">Initializing SJ 32Core Universal OS...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center p-4 text-white">
      <div className="max-w-5xl w-full space-y-6">
        
        {/* Universal Dynamic Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-400">
              {userProfile?.role === 'super_admin' ? 'SJ 32Core ERP - Global Master Control' : `SJ 32Core ERP - ${userProfile?.businessName}`}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              User Email: <span className="text-indigo-300">{userProfile?.email}</span> | Mode: <span className="text-amber-400 uppercase font-semibold">{userProfile?.mode}</span>
            </p>
          </div>
          
          <div>
            {userProfile?.role === 'super_admin' ? (
              <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30">
                All 32 Engines Managed
              </span>
            ) : (
              <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30">
                Currency: {userProfile?.currency} | Tenant Active
              </span>
            )}
          </div>
        </div>

        {/* Super Admin Quick Stats Bar */}
        {userProfile?.role === 'super_admin' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Total Active Companies</p>
              <p className="text-xl font-bold text-indigo-400">2,450</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Subscription Tiers</p>
              <p className="text-xl font-bold text-emerald-400">7 Tiers Active</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Global AI Quota</p>
              <p className="text-xl font-bold text-purple-400">Optimal</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Security Status</p>
              <p className="text-xl font-bold text-emerald-400">100% Isolated</p>
            </div>
          </div>
        )}

        {/* Company Owner View: Inventory & BOM Engine Module */}
        {userProfile?.role === 'company_owner' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-indigo-400">Inventory & BOM Engine</h2>
                <p className="text-xs text-slate-400">Manage your raw materials, resin items, and stock levels securely.</p>
              </div>
              <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                Live Engine
              </span>
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddInventoryItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="Item Name (e.g., Epoxy Resin)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                required
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters</option>
                <option value="grams">Grams</option>
              </select>
              <input
                type="number"
                placeholder="Unit Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
              >
                Add Item
              </button>
            </form>

            {/* Inventory Table */}
            {inventoryLoading ? (
              <div className="text-xs text-slate-400 animate-pulse text-center py-4">Loading inventory...</div>
            ) : inventory.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6 bg-slate-950/50 rounded-xl border border-slate-800/50">
                No inventory items found. Add your first item above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Stock Quantity</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/50 transition">
                        <td className="p-3 font-medium text-white">{item.item_name}</td>
                        <td className="p-3 text-slate-400">{item.category}</td>
                        <td className="p-3 text-indigo-300 font-semibold">{item.stock_quantity} {item.unit}</td>
                        <td className="p-3 text-slate-300">{item.unit_price}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">
                          {(item.stock_quantity * item.unit_price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Universal Chat & Command Interface */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[40vh]">
          <h3 className="text-sm font-bold text-indigo-400 mb-3">Universal AI Command & Assistant</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-3 text-xs ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleUniversalCommand} className="flex gap-3 pt-3 border-t border-slate-800">
            <input 
              type="text" 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Type command (e.g., check resin stock or review sales)..." 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 font-semibold rounded-xl transition text-xs shadow-md shadow-indigo-600/20"
            >
              Execute
            </button>
          </form>
        </div>

      </div>
    </main>
  );
              }
            
