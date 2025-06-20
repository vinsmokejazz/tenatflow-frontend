import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from './types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = [
    '/dashboard', // Include base dashboard
    '/dashboard/admin', // Include admin dashboard
    '/contacts',
    '/deals',
    '/reports',
    '/follow-ups',
    '/ai-insights',
    '/documents',
  ]; // Add all protected routes

  const adminRoutes = [
    '/dashboard/admin',
    // Add other admin-only routes here, e.g., '/settings/billing'
  ];

  const publicRoutes = [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]; // Add all public routes

  const { pathname } = req.nextUrl;

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return res;
  }

  // Add '/dashboard/admin/staff' to adminRoutes
  if (pathname.startsWith('/dashboard/admin/staff')) {
    if (!adminRoutes.includes('/dashboard/admin/staff')) {
      adminRoutes.push('/dashboard/admin/staff');
    }
  }
  // Redirect to signin if no session for protected routes
  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle authenticated users for protected routes
  if (session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const userRole = session.user?.user_metadata?.role;

    // Check for admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (userRole !== 'admin') {
        // Redirect non-admins from admin routes
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard'; // Redirect to a general authenticated page
        return NextResponse.redirect(redirectUrl);
      }
    }

    // For other protected routes, ensure the user has a role (admin or staff)
    // If roles are strictly 'admin' or 'staff', you might not need this check
    // if (userRole !== 'admin' && userRole !== 'staff') {
    //   const redirectUrl = req.nextUrl.clone();
    //   redirectUrl.pathname = '/unauthorized'; // Redirect to an unauthorized page
    //   return NextResponse.redirect(redirectUrl);
    // }

    // Continue to the protected route if authorized
    return res;
  }

  // If the path is not in protected or public routes, allow access by default
  // You might want to adjust this based on your routing strategy
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (api routes)
     * - Any files in the public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};