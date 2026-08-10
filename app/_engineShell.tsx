"use client";

import React from "react";
import Sidebar from "../src/components/Sidebar";
import AskSteve from "../src/components/AskSteve";

export default function EngineShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-row w-full">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
      <AskSteve />
    </div>
  );
}
