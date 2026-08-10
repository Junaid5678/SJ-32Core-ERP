"use client";

import React from 'react';
import Link from 'next/link';

export default function AskSteve(){
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/ai-screen">
        <button aria-label="Ask Steve" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded shadow-lg">
          <span className="font-semibold">Ask Steve</span>
        </button>
      </Link>
    </div>
  );
}
