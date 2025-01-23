// app/api/auth/resend/route.ts
import { NextResponse } from 'next/server'
import { emailService } from '@/lib/services/emailService'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    const accessCode = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60000)

    // Fetch user data
    const { data: user, error } = await supabase
      .from('users')
      .select('first_name')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Update access code and expiration in the database
    await supabase
      .from('users')
      .update({
        access_code: accessCode,
        access_code_expires_at: expiresAt
      })
      .eq('email', email)

    // Send the access code via email
    await emailService.sendAccessCode({
      to: email,
      firstName: user.first_name,
      accessCode,
      isExistingUser: true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in resend route:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
