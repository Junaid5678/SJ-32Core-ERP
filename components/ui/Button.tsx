import React from 'react';

export default function Button({ children, className = '', ...props }: any) {
  return (
    <button
      {...props}
      className={"inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-slate-100 " + className}
    >
      {children}
    </button>
  );
}
