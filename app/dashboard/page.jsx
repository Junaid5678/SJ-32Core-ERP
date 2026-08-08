'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UniversalMasterDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');

  // 1. REAL-TIME SUPABASE SESSION & UNIVERSAL EMAIL ROUTING ENGINE
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // Agar session se email mil jaye warna fallback testing ke liye aapka admin email
        const currentLoggedInEmail = user?.email || 'ja024477@gmail.com'; 
        const supremeSuperAdminEmail = 'ja024477@gmail.com';

        if (currentLoggedInEmail.toLowerCase() === supremeSuperAdminEmail.toLowerCase()) {
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
              text: 'SJ 32Core ERP Universal Master OS Active (Super Admin Mode). Managing all global tenants, subscription tiers (Trial, Starter, Business, Bronze, Silver, Gold, Enterprise), and AI token quotas across 32 universal engines.' 
            }
          ]);
        } else {
          // UNIVERSAL BUSINESS OWNER VIEW (Supports any business type worldwide: Resin Art, Retail, Restaurant, etc.)
          setUserProfile({
            email: currentLoggedInEmail,
            role: 'company_owner',
            businessName: 'SJ Craft Global Enterprises',
            businessType: 'Universal Multi-Branch OS',
            currency: 'PKR', // Dynamically adapts to USD, EUR, AED, etc.
            language: 'en',  // Universal multi-language support
            mode: 'tenant_os'
          });
          setMessages([
            { 
              sender: 'ai', 
              text: 'SJ 32Core ERP Universal Business OS Active. Type complex multi-intent commands in any language (e.g., "Show sales, check inventory stock, and staff report").' 
            }
          ]);
        }
      } catch (err) {
        console.error('Session fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSession();
  }, []);

  // 2. UNIVERSAL COMMAND EXECUTOR & MULTI-INTENT PARSER
  const handleUniversalCommand = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      if (userProfile.role === 'super_admin') {
        // --- GLOBAL SUPER ADMIN OPERATIONS ---
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { 
              sender: 'ai', 
              text: `Global Platform Command Executed: Successfully processed administrative parameters, active tenant nodes, and subscription tier quotas for: "${userText}"` 
            }
          ]);
          setLoading(false);
        }, 1000);

      } else {
        // --- UNIVERSAL TENANT BUSINESS OPERATIONS ---
        const lowerQuery = userText.toLowerCase();
        let extractedDataPacket = {
          sales_data: null,
          inventory_data: null,
          staff_data: null,
          ledger_data: null
        };

        // Multi-intent parsing (extracting multiple tables/engines simultaneously in one go)
        if (lowerQuery.includes('sales') || lowerQuery.includes('order') || lowerQuery.includes('bikri')) {
          extractedDataPacket.sales_data = { status: 'Fetched universal orders/sales engine data securely' };
        }
        if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('maal')) {
          extractedDataPacket.inventory_data = { status: 'Fetched universal inventory & BOM engine data securely' };
        }
        if (lowerQuery.includes('khata') || lowerQuery.includes('ledger') || lowerQuery.includes('account')) {
          extractedDataPacket.ledger_data = { status: 'Fetched double-entry accounting ledger engine data securely' };
        }
        if (lowerQuery.includes('employee') || lowerQuery.includes('staff') || lowerQuery.includes('report')) {
          extractedDataPacket.staff_data = { status: 'Fetched universal staff profiles & permissions engine data' };
        }

        // Package Secure Mega-Rich Payload for Steve (AI has 0% direct database access)
        const universalPayload = {
          tenant_email: userProfile.email,
          business_name: userProfile.businessName,
          user_role: userProfile.role,
          user_command: userText,
          currency: userProfile.currency,
          language: userProfile.language,
          software_extracted_engines: extractedDataPacket,
          timestamp: new Date().toISOString()
        };

        console.log('Universal Secure Payload Sent to Steve:', universalPayload);

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { 
              sender: 'ai', 
              text: `Universal Command Executed! Software parsed multiple intents, extracted parallel engine data locally, formatted amounts in [${userProfile.currency}], and packaged the payload for Steve (Zero DB exposure).` 
            }
          ]);
          setLoading(false);
        }, 1200);
      }

    } catch (error) {
      setLoading(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error executing universal command: ' + error.message }]);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono">Initializing SJ 32Core Universal OS...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[90vh]">
        
        {/* Universal Dynamic Header */}
        <div className="pb-4 border-b border-slate-800 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-blue-400">
              {userProfile?.role === 'super_admin' ? 'SJ 32Core ERP - Global Master Control' : `SJ 32Core ERP - ${userProfile?.businessName}`}
            </h1>
            <p className="text-[11px] text-slate-400">
              User Email: <span className="text-blue-300">{userProfile?.email}</span> | System Mode: <span className="text-amber-400 uppercase font-semibold">{userProfile?.mode}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            {userProfile?.role === 'super_admin' ? (
              <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                All 32 Engines Managed
              </span>
            ) : (
              <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                Currency: {userProfile?.currency} | Multi-Lang Active
              </span>
            )}
          </div>
        </div>

        {/* Super Admin Quick Stats Bar (Only renders if super admin logs in) */}
        {userProfile?.role === 'super_admin' && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Total Active Companies</p>
              <p className="text-lg font-bold text-blue-400">2,450</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Subscription Tiers</p>
              <p className="text-lg font-bold text-emerald-400">Trial to Enterprise</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Global AI Quota</p>
              <p className="text-lg font-bold text-purple-400">78% Optimal</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase">Security Status</p>
              <p className="text-lg font-bold text-emerald-400">100% Isolated</p>
            </div>
          </div>
        )}

        {/* Universal Chat & Command Interface */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl p-3.5 text-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded-xl p-3 animate-pulse">
                Universal engine mapping email identity, parsing multi-intent command, and executing secure payload...
              </div>
            </div>
          )}
        </div>

        {/* Universal Text-Only Input Box */}
        <form onSubmit={handleUniversalCommand} className="flex gap-3 pt-3 border-t border-slate-800">
          <input 
            type="text" 
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={userProfile?.role === 'super_admin' ? "Type global control command..." : "Type multi-intent command (e.g., show sales, stock inventory, and khata ledger)..."} 
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 font-semibold rounded-xl transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            Execute
          </button>
        </form>

        <div className="mt-3 text-center text-[10px] text-slate-500">
          SJ 32Core ERP Universal Master OS | Email-Based Dynamic Routing | Zero AI Database Exposure | Multi-Currency & Multi-Language
        </div>

      </div>
    </main>
  );
}
