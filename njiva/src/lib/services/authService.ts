// lib/services/authService.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const authService = {
  async startAuth(email: string) {
    const supabase = createClientComponentClient()
    const accessCode = Math.floor(1000 + Math.random() * 9000).toString()
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({ 
          email,
          access_code: accessCode,
          access_code_expires_at: new Date(Date.now() + 15 * 60000)
        }, { onConflict: 'email' })
        
      if (error) throw error
      return { success: true, email }
    } catch (error) {
      console.error('Auth error:', error)
      return { success: false, error: 'Failed to start auth' }
    }
  }
}