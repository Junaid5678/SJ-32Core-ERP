'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AIScreenComponent() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'steve', text: 'Salam! Main Steve hoon, aapka 32Core ERP AI Agent. Aap mujh se apne business, inventory, ya sales ke baray mein kuch bhi pooch sakte hain.' }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert('Unauthorized: Please login first.');
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      const isSuperAdmin = userEmail === 'ja024478@gmail.com';

      const { data: profileData } = await supabase
        .from('profiles')
        .select('tenant_id, role, staff_id')
        .eq('id', session.user.id)
        .single();

      const userContext = {
        userId: session.user.id,
        email: userEmail,
        role: isSuperAdmin ? 'super_admin' : (profileData?.role || 'company_owner'),
        tenantId: isSuperAdmin ? 'GLOBAL_SUPER_ADMIN_TENANT' : (profileData?.tenant_id || null),
        staffId: profileData?.staff_id || 'SA-001',
        permissions: isSuperAdmin ? ['ALL_ENGINES_ACCESS'] : ['TENANT_SCOPED_ACCESS']
      };

      const webhookPayload = {
        eventType: 'AI_QUERY_SUBMITTED',
        tenantId: userContext.tenantId,
        userContext: userContext,
        payload: {
          userQuery: userMsg,
          timestamp: new Date().toISOString()
        }
      };

      const res = await fetch('/api/webhook/steve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STEVE_WEBHOOK_SECRET || ''}` 
        },
        body: JSON.stringify(webhookPayload)
      });

      const result = await res.json();
      
      // Extract response message or fallback to JSON string representation
      const steveReply = result.message || result.reply || JSON.stringify(result, null, 2);

      setMessages((prev) => [...prev, { sender: 'steve', text: steveReply }]);

    } catch (err) {
      console.error('AI Screen Error:', err);
      setMessages((prev) => [...prev, { sender: 'steve', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-slate-900 text-white p-4">
      {/* Header */}
      <div className="py-4 border-b border-slate-800 mb-4">
        <h2 className="text-xl font-bold text-emerald-400">SJ 32Core ERP - Steve AI Gateway</h2>
        <p className="text-xs text-slate-400">Multi-Intent Enterprise Operating System Assistant</p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-2xl text-sm text-slate-400 rounded-bl-none animate-pulse">
              Steve is analyzing engines & processing query...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleAISubmit} className="flex gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Steve anything (e.g. Sales report, Inventory stock)..."
          className="flex-1 bg-transparent px-3 py-2 text-white focus:outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 text-white shadow"
        >
          Send
        </button>
      </form>
    </div>
  );
}


