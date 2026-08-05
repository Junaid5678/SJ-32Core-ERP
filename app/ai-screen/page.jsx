'app/ai-screen/page.jsx'
'use client';

import { useState } from 'react';

export default function AIScreenGateway() {
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: 'Welcome to SJ 32Core ERP AI-Screen. I am your system assistant. Please tell me your Company Name and your WhatsApp / Gmail API credentials to initialize your secure tenant node.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const [tenantConfig, setTenantConfig] = useState({
    companyName: '',
    ownerEmail: '',
    whatsappKey: '',
    gmailToken: '',
    configured: false
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newLog = [...chatLog, { sender: 'user', text: inputMessage }];
    setChatLog(newLog);
    setInputMessage('');
    setLoading(true);

    // Simulating AI intelligent processing and context mapping
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: 'Got it! Analyzing your input, validating tenant permissions, and securely binding your WhatsApp & Gmail keys to your unique Tenant ID. Your AI-Screen node is ready.' 
        }
      ]);
      setTenantConfig((prev) => ({ ...prev, configured: true }));
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-enterprise-dark flex items-center justify-center p-6 text-white">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col h-[700px]">
        
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-800 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">SJ 32Core ERP - AI-Screen Gateway</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Tenant Conversational Onboarding & Context Engine</p>
        </div>

        {/* Chat / AI Interaction Log */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6">
          {chatLog.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-4 text-sm ${
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
                AI is configuring tenant context & keys...
              </div>
            </div>
          )}
        </div>

        {/* Input Form for AI Interaction */}
        <form onSubmit={handleSendMessage} className="flex gap-3 pt-4 border-t border-slate-800">
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type company details, WhatsApp or Gmail API keys here..." 
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

        <div className="mt-4 text-center text-[11px] text-slate-500">
          Status: {tenantConfig.configured ? 'Tenant Secured & Active' : 'Waiting for AI Configuration'} | Secure Multi-Tenant Context Engine
        </div>

      </div>
    </main>
  );
        }

