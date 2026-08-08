import React from 'react';

export default function Input({ className = '', ...props }: any) {
  return (
    <input
      {...props}
      className={"w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-400 " + className}
    />
  );
}
