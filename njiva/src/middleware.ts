// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log(`[MIDDLEWARE] Mounted**********************`);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Fallback to localhost during development

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('njiva-session');

  console.log(`[MIDDLEWARE]: Handling route "${pathname}"`);

  // Handle root ("/") and dashboard ("/dashboard") routes
  if (pathname === '/' || pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      console.log(`[MIDDLEWARE]: No session token found for "${pathname}"`);
      
      if (pathname.startsWith('/dashboard')) {
        console.log('[MIDDLEWARE]: Redirecting unauthenticated user to "/"');
        return NextResponse.redirect(new URL('/', APP_URL));
      }

      console.log('[MIDDLEWARE]: Allowing access to "/"');
    } else {
      console.log(`[MIDDLEWARE]: Session token found for "${pathname}"`);

      if (pathname === '/') {
        console.log('[MIDDLEWARE]: Redirecting authenticated user to "/dashboard"');
        return NextResponse.redirect(new URL('/dashboard', APP_URL));
      }

      console.log('[MIDDLEWARE]: Allowing access to "/dashboard"');
    }
  }

  return NextResponse.next(); // Proceed with the request
}

export const config = {
  matcher: ['/', '/dashboard'], // Match `/` and `/dashboard`
};
