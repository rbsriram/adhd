import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const sessionToken = request.cookies.get('njiva-session')

  console.log(`[MIDDLEWARE] Received request for pathname: ${pathname}`);
  console.log(`[MIDDLEWARE] njiva-session token: ${sessionToken || 'No session token found'}`);

  // Handle the base URL (`/`)
  if (pathname === '/') {
    console.log('**********************[MIDDLEWARE]: Handling base URL "/" ***********************');
    if (sessionToken) {
      console.log('[MIDDLEWARE]: Session token found. Redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', APP_URL)) // Redirect logged-in users to `/dashboard`
    }
    console.log('[MIDDLEWARE]: No session token. Allowing access to "/"');
    return NextResponse.next() // Allow unauthenticated users to access `/`
  }

  // Handle `/dashboard` route
  if (pathname.startsWith('/dashboard')) {
    console.log('**********************[MIDDLEWARE]: Handling /dashboard route ***********************');
    if (!sessionToken) {
      console.log('[MIDDLEWARE]: No session token found. Redirecting to "/"');
      return NextResponse.redirect(new URL('/', APP_URL)) // Redirect unauthenticated users to `/`
    }
    console.log('[MIDDLEWARE]: Session token found. Allowing access to /dashboard');
  }

  console.log('[MIDDLEWARE]: Allowing request to proceed');
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard'], // Match `/` and `/dashboard`
}
