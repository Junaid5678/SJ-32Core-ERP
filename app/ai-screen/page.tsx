"use client";

import React, { useState } from 'react';

export default function AIScreen() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{from:string;text:string}>>([{from:'system', text:'Hi, I am Steve. How can I help?'}]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {from:'user', text:input}]);
    setInput('');
    // simple echo for placeholder
    setTimeout(()=> setMessages(prev=> [...prev, {from:'steve', text:`Steve: I received "${input}"`}]), 600);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto card">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ask Steve — AI Assistant</h2>
          <button onClick={()=> setOpen(false)} className="text-sm text-slate-500">Close</button>
        </header>

        <div className="mt-4 h-[60vh] overflow-auto border rounded p-3 bg-slate-50 dark:bg-slate-900">
          {messages.map((m, idx) => (
            <div key={idx} className={`mb-2 ${m.from==='user'?'text-right':''}`}>
              <div className={`inline-block px-3 py-2 rounded ${m.from==='user'?'bg-indigo-600 text-white':'bg-slate-100 dark:bg-slate-800'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input value={input} onChange={(e)=> setInput(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
          <button onClick={send} className="px-4 py-2 bg-emerald-500 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
