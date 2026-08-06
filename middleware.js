import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Supreme Super Admin Email List
const SUPER_ADMIN_EMAILS = ['ja024478@gmail.com']; 

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Session check
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // 1. Agar user login nahi hai aur public page (jaise /login) par nahi hai, toh login par bhej do
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. Agar user login hai aur login page par jana chahta hai, toh dashboard par bhej do
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 3. Super Admin & Tenant Authorization Logic
  if (session) {
    const userEmail = session.user.email;
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);

    if (isSuperAdmin) {
      // Aap Supreme Super Admin hain, aapko har jagah access milega
      return res;
    } else {
      // Yeh logic future mein tenant-based routing ke liye use hogi
      // Filhal normal business owners ke liye
      return res;
    }
  }

  return res;
}

// Routes jin par middleware apply hoga
export const config = {
  matcher: ['/dashboard/:path*', '/ai-screen/:path*', '/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};

