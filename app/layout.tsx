import './globals.css'
import React from 'react'
import { getUserEmailFromSession } from '../src/lib/tenant'
import isSuperAdminEmail from '@/lib/isSuperAdmin'
import ThemeProvider from './providers/ThemeProvider'
import ThemeToggle from './components/ThemeToggle'

export const metadata = {
  title: 'SJ 32Core ERP',
  description: 'Universal multi-tenant ERP',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Master layout: loads user email for email-based routing. Keep logic minimal here.
  let userEmail: string | null = null;
  try {
    userEmail = await getUserEmailFromSession();
  } catch (e) {
    // silently ignore — unauthenticated
  }

  const isSuperAdmin = isSuperAdminEmail(userEmail);

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        <ThemeProvider>
          <div className="max-w-full min-h-screen">
            <header className="border-b border-slate-800 p-3 sm:p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">SJ</div>
                  <div>
                    <div className="text-sm font-semibold">SJ 32Core ERP</div>
                    <div className="text-xs text-slate-400">Universal multi-tenant OS</div>
                  </div>
                </div>

                <div className="text-sm text-slate-300 flex items-center gap-3">
                  {userEmail ? (
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block">{userEmail}</div>
                      {isSuperAdmin && <span className="px-2 py-1 rounded bg-indigo-700 text-indigo-200 text-xs">Super Admin</span>}
                    </div>
                  ) : (
                    <div className="text-slate-500">Not signed in</div>
                  )}

                  <div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
