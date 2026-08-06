'use client';

import { useState, useEffect } from 'react';

export default function AIScreen() {
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');

  // UNIVERSAL EMAIL & ROLE DETECTION ON LOGIN
  useEffect(() => {
    // In production, this comes from Supabase auth session: supabase.auth.getUser()
    const currentUserEmail = 'admin@sj32core.com'; // Change to test Tenant Owner email e.g. 'owner@sjcraft.com'
    const superAdminEmail = 'admin@sj32core.com';

    if (currentUserEmail === superAdminEmail) {
      setUserSession({
        email: currentUserEmail,
        role: 'super_admin',
        name: 'Supreme Platform Owner'
      });
      setMessages([
        { 
          sender: 'ai', 
          text: 'SJ 32Core ERP Universal AI-Screen Active (Super Admin Mode). Managing global platforms, active tenant nodes, pricing tiers (Trial, Starter, Business, Bronze, Silver, Gold, Enterprise), and AI token quotas.' 
        }
      ]);
    } else {
      setUserSession({
        email: currentUserEmail,
        role: 'company_owner',
        companyName: 'SJ Craft Resin Art',
        currency: 'PKR',
        language: 'en'
      });
      setMessages([
        { 
          sender: 'ai', 
          text: 'SJ 32Core ERP Universal AI-Screen Active (Business OS Mode). Type complex multi-intent commands in any language (e.g., "Show sales, check inventory, and staff report").' 
        }
      ]);
    }
    setLoading(false);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    
    // 1. Add user command to chat UI
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      if (userSession.role === 'super_admin') {
        // Super Admin Global Processing Logic
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { 
              sender: 'ai', 
              text: `Global Platform Command Executed: Successfully processed administrative parameters and tenant distribution quotas for: "${userText}"` 
            }
          ]);
          setLoading(false);
        }, 1000);

      } else {
        // Tenant Business OS: Multi-Intent Parsing & Software-Side Data Extraction
        const lowerQuery = userText.toLowerCase();
        let fetchedDataPacket = {
          sales_data: null,
          inventory_data: null,
          staff_data: null
        };

        // Software checks for multiple keywords simultaneously (Multi-Intent Support)
        if (lowerQuery.includes('sales') || lowerQuery.includes('order') || lowerQuery.includes('bikri')) {
          fetchedDataPacket.sales_data = { status: 'Fetched orders table securely via software' };
        }

        if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('maal')) {
          fetchedDataPacket.inventory_data = { status: 'Fetched inventory stocks table securely via software' };
        }

        if (lowerQuery.includes('employee') || lowerQuery.includes('staff') || lowerQuery.includes('report')) {
          fetchedDataPacket.staff_data = { status: 'Fetched staff profiles table securely via software' };
        }

        // Build Mega-Rich Payload for Steve (Zero DB access for AI Agent)
        const megaRichPayload = {
          tenant_id: userSession.companyName,
          user_role: userSession.role,
          user_command: userText,
          tenant_currency: userSession.currency,
          detected_language: userSession.language,
          software_extracted_data: fetchedDataPacket,
          timestamp: new Date().toISOString()
        };

        console.log('Secure Mega-Rich Payload Sent to Steve:', megaRichPayload);

        // Simulating response after software fetches data locally and sends payload
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { 
              sender: 'ai', 
              text: `Command processed successfully! Software parsed your request, fetched multi-intent database tables in parallel, formatted currency in [${userSession.currency}], and packaged the payload for Steve without exposing direct database access.` 
            }
          ]);
          setLoading(false);
        }, 1200);
      }

    } catch (error) {
      setLoading(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error executing command: ' + error.message }]);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Universal AI-Screen...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[85vh]">
        
        {/* Universal Header */}
        <div className="pb-4 border-b border-slate-800 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-blue-400">
              {userSession.role === 'super_admin' ? 'SJ 32Core ERP - Global Super Admin AI-Screen' : `SJ 32Core ERP - ${userSession.companyName} AI-Screen`}
            </h1>
            <p className="text-[11px] text-slate-400">
              Email: <span className="text-blue-300">{userSession.email}</span> | Role: <span className="text-amber-400 uppercase font-semibold">{userSession.role}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            {userSession.role === 'super_admin' ? (
              <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                Global Control Active
              </span>
            ) : (
              <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                Currency: {userSession.currency}
              </span>
            )}
          </div>
        </div>

        {/* Chat / Command Log */}
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
                Universal engine validating email, parsing multi-intent query & fetching parallel data...
              </div>
            </div>
          )}
        </div>

        {/* Text-Only Input Form (No File Upload, No Mic, No Camera) */}
        <form onSubmit={handleSendMessage} className="flex gap-3 pt-3 border-t border-slate-800">
          <input 
            type="text" 
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={userSession.role === 'super_admin' ? "Type global system command..." : "Type multi-intent command in any language (e.g. show sales, stock, and reports)..."} 
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 font-semibold rounded-xl transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            Send
          </button>
        </form>

        <div className="mt-3 text-center text-[10px] text-slate-500">
          Universal Email Routing | Zero Database Access for AI | Multi-Language & Multi-Currency Engine
        </div>

      </div>
    </main>
  );
        }

