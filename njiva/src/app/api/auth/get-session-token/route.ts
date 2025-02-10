import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  console.log('[Get-Session-Token] Fetching session token from cookies...');
  const cookieStore = await cookies(); // Add 'await' here
  const sessionToken = cookieStore.get('njiva-session')?.value;

  if (!sessionToken) {
    console.warn('[Get-Session-Token] No session token found in cookies.');
    return NextResponse.json({ error: 'No session token found' }, { status: 401 });
  }

  console.log('[Get-Session-Token] Session token fetched successfully.');
  return NextResponse.json({ token: sessionToken });
}