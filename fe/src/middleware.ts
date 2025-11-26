import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect root path to /login
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboard = pathname.startsWith('/dashboard');

  const token = req.cookies.get('token')?.value;

  if (isDashboard && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = '/dashboard';
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};