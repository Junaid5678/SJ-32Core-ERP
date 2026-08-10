"use client";

import React from "react";
import ThemeProvider from "@/components/ThemeToggle";
import EngineShell from "@/app/_engineShell";
import "@/styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen">
        <ThemeProvider>
          <EngineShell>{children}</EngineShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
