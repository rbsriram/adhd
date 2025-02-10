// app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import { emailService } from '@/lib/services/emailService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log(`[SIGNIN] Processing signin for email: ${email}`);

    // Fetch user data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('first_name')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      console.error(`[SIGNIN] User not found for email: ${email}`, fetchError);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate access code and expiration
    const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString(); // 15 minutes expiration
    console.log(`[SIGNIN] Generated access code for email: ${email}`);

    // Update access code in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        access_code: accessCode,
        access_code_expires_at: expiresAt,
      })
      .eq('email', email);

    if (updateError) {
      console.error(`[SIGNIN] Failed to update access code for email: ${email}`, updateError);
      return NextResponse.json({ success: false, error: 'Failed to update access code' }, { status: 500 });
    }

    // Send access code via email
    await emailService.sendAccessCode({
      to: email,
      firstName: user.first_name,
      accessCode,
      isExistingUser: true,
    });
    console.log(`[SIGNIN] Access code sent successfully to email: ${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SIGNIN] Server error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
