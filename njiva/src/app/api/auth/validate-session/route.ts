import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    // Extract session token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('[Validate-Session] Missing Authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[Validate-Session] Token received:', token);

    // Parse the token format: custom-session-token-{user_id}-{firstName}-{timestamp}
    const tokenParts = token.split('-');
    if (tokenParts.length < 6 || tokenParts[0] !== 'custom' || tokenParts[1] !== 'session' || tokenParts[2] !== 'token') {
      console.error('[Validate-Session] Invalid session token format');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract user_id (UUID format: 8-4-4-4-12 characters)
    const userId = `${tokenParts[3]}-${tokenParts[4]}-${tokenParts[5]}-${tokenParts[6]}-${tokenParts[7]}`;
    const firstName = tokenParts[8]; // Extract firstName
    const timestamp = tokenParts[9]; // Extract timestamp

    console.log(`[Validate-Session] Parsed token - User ID: ${userId}, First Name: ${firstName}, Timestamp: ${timestamp}`);

    // Fetch user details from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('first_name')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      console.error('[Validate-Session] User not found or Supabase error');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log(`[Validate-Session] Session validated for user: ${user.first_name}`);
    return NextResponse.json({ firstName: user.first_name });
  } catch (error) {
    console.error('[Validate-Session] Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}