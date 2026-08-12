'use client';
import { useState } from 'react';

export default function AskSteve() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const toggle = () => setOpen((s) => !s);

  const send = async () => {
    if (!value) return;
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ q: value }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { from: 'you', text: value }, { from: 'steve', text: data.answer }]);
    setValue('');
  };

  return (
    <>
      <button onClick={toggle} aria-label="Ask Steve" className="fixed right-6 bottom-6 z-50 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg">S</button>
      {open && (
        <div className="fixed right-6 bottom-24 z-50 w-96 h-96 bg-white border rounded shadow-lg p-3 flex flex-col">
          <div className="flex-1 overflow-auto">
            {messages.map((m, i) => <div key={i} className={`my-2 ${m.from==='steve' ? 'text-left' : 'text-right'}`}>{m.text}</div>)}
          </div>
          <div className="mt-2 flex">
            <input value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 border rounded p-2" />
            <button onClick={send} className="ml-2 bg-indigo-600 text-white p-2 rounded">Ask</button>
          </div>
        </div>
      )}
    </>
  );
}
