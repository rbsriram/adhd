// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function POST(request: Request) {
  const { email, code } = await request.json()
  console.log(`[VERIFY] Received request for email: ${email} and code: ${code}`)

  try {
    // Step 1: Validate the access code
    console.log(`[VERIFY] Checking access code for email: ${email}`)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('access_code', code)
      .single()

    if (error || !user) {
      console.error(`[VERIFY] Invalid code for email: ${email}`, error)
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 401 })
    }

    console.log(`[VERIFY] Access code validated for email: ${email}`)

    if (new Date(user.access_code_expires_at) < new Date()) {
      console.error(`[VERIFY] Access code expired for email: ${email}`)
      return NextResponse.json({ success: false, error: 'Code expired' }, { status: 401 })
    }

    // Step 2: Generate a custom session token
    const sessionToken = `custom-session-token-${user.user_id}-${Date.now()}`
    console.log(`[VERIFY] Session token generated for email: ${email}`)

    // Set the session token as a secure cookie
    const response = NextResponse.json({ success: true, message: 'Authenticated' })
    response.cookies.set('njiva-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day expiration
    })
    console.log(`[VERIFY] Setting njiva-session cookie for email: ${email} with token: ${sessionToken}`);
    // Step 3: Clear the access code
    console.log(`[VERIFY] Clearing access code for email: ${email}`)
    await supabase
      .from('users')
      .update({
        access_code: null,
        access_code_expires_at: null,
        last_login_at: new Date().toISOString(),
      })
      .eq('email', email)

    console.log(`[VERIFY] Access code cleared for email: ${email}`)

    return response
  } catch (error) {
    console.error(`[VERIFY] Server error for email: ${email}`, error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}


