import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Supreme Super Admin Email List
const SUPER_ADMIN_EMAILS = ['ja024478@gmail.com'];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Public pages: allow
  const PUBLIC_PATHS = ['/', '/login', '/signup', '/api', '/favicon.ico', '/_next'];
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    // If user already logged-in and hits /login, redirect to proper dashboard
    if (session && pathname === '/login') {
      const userEmail = session.user?.email ?? '';
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);
      const destination = isSuperAdmin ? '/dashboard/admin' : '/dashboard';
      return NextResponse.redirect(new URL(destination, req.url));
    }
    return res;
  }

  // Require auth for everything under /dashboard or app-protected routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // For authenticated sessions: allow access. If you want additional tenant checks,
  // call DB here (using createMiddlewareClient) to confirm user role/tenant belongs to requested path.
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/ai-screen/:path*'],
};
