// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  const { email, code } = await request.json();
  console.log(`[VERIFY] Received request for email: ${email}`);

  try {
    // Verify access code
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('access_code', code)
      .single();

    if (error || !user) {
      console.error(`[VERIFY] Invalid code or user not found for email: ${email}`);
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 401 });
    }

    if (new Date(user.access_code_expires_at) < new Date()) {
      console.error(`[VERIFY] Access code expired for email: ${email}`);
      return NextResponse.json({ success: false, error: 'Code expired' }, { status: 401 });
    }

    // Generate session token
    const sessionToken = `custom-session-token-${user.user_id}-${user.first_name}-${Date.now()}`;
    console.log(`[VERIFY] Generated session token for email: ${email}`);

    // Set session cookie
    const response = NextResponse.json({ success: true, message: 'Authenticated' }, {
      headers: {
        'Set-Cookie': `njiva-session=${sessionToken}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`,
      },
    });

    // Clear access code
    await supabase
      .from('users')
      .update({
        access_code: null,
        access_code_expires_at: null,
        last_login_at: new Date().toISOString(),
      })
      .eq('email', email);

    console.log(`[VERIFY] Cleared access code and updated last login for email: ${email}`);
    return response;

  } catch (error) {
    console.error(`[VERIFY] Server error for email: ${email}`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
