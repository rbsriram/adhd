// app/api/auth/start/route.ts
import { NextResponse } from 'next/server'
import { emailService } from '@/lib/services/emailService'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json()

    const accessCode = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60000) // 15 minutes

    // Capitalize first name for consistency
    const capitalizedName = firstName
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase())

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('first_name')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      // Update access code for the existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          access_code: accessCode,
          access_code_expires_at: expiresAt
        })
        .eq('email', email.toLowerCase())

      if (updateError) throw updateError

      // Send email for existing user
      await emailService.sendAccessCode({
        to: email,
        firstName: existingUser.first_name,
        accessCode,
        isExistingUser: true
      })

      return NextResponse.json({
        success: true,
        isExistingUser: true,
        message: 'Email exists. Access code sent.'
      })
    }

    // Create a new user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        first_name: capitalizedName,
        access_code: accessCode,
        access_code_expires_at: expiresAt
      })

    if (insertError) throw insertError

    // Send welcome email to new user
    await emailService.sendAccessCode({
      to: email,
      firstName: capitalizedName,
      accessCode,
      isExistingUser: false
    })

    return NextResponse.json({ success: true, isExistingUser: false })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}