// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
console.log(`[LOGOUT] Mounted**********************`);
export async function POST() {
  try {
    console.log('[LOGOUT] Clearing njiva-session cookie...');
    // Clear the custom session cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('njiva-session', '', { maxAge: 0, path: '/' }); // Expire the cookie

    console.log('[LOGOUT] njiva-session cookie cleared');
    return response;
  } catch (error) {
    console.error('[LOGOUT] Error during logout:', error);
    return new Response('Error logging out', { status: 500 });
  }
}
