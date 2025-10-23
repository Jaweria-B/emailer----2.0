// src/middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const response = NextResponse.next();

  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile'];
  const authRoutes = ['/login', '/register'];

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Validate session token by calling an internal API route (Node runtime)
  let isValidSession = false;
  if (sessionToken) {
    try {
      const url = new URL('/api/auth/validate-session', request.url).toString();
      const validateRes = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        // pass token in body (or let API read cookie if you forward it)
        body: JSON.stringify({ sessionToken }),
      });

      if (validateRes.ok) {
        const payload = await validateRes.json();
        isValidSession = !!payload.valid;
      } else {
        // treat non-2xx as invalid
        response.cookies.delete('session_token');
      }
    } catch (err) {
      console.error('Session validation fetch error:', err);
      response.cookies.delete('session_token');
    }
  }

  // Redirect logic (same as before)
  if (isProtectedRoute && !isValidSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
