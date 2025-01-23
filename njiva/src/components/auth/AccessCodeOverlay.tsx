// components/auth/AccessCodeOverlay.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'

interface AccessCodeOverlayProps {
 email: string
 onClose: () => void
 isExistingUser?: boolean
 message?: string
}

export default function AccessCodeOverlay({ email, onClose, isExistingUser, message }: AccessCodeOverlayProps) {
 const [code, setCode] = useState(['', '', '', ''])
 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)
 const inputs = useRef<(HTMLInputElement | null)[]>([])
 const router = useRouter()

 const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
   if (e.key === 'Backspace' && !code[index]) {
     if (index > 0) {
       inputs.current[index - 1]?.focus()
     }
   }
 }

 const handleInput = (index: number, value: string) => {
   if (!/^\d*$/.test(value)) return
   const singleDigit = value.slice(-1)
   
   setCode(prev => {
     const newCode = [...prev]
     newCode[index] = singleDigit
     return newCode
   })

   if (singleDigit && index < 3) {
     inputs.current[index + 1]?.focus()
   }
 }

 const handleSubmit = async () => {
   const accessCode = code.join('')
   if (accessCode.length !== 4) return

   setLoading(true)
   setError('')

   try {
     const response = await fetch('/api/auth/verify', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, code: accessCode })
     })

     const data = await response.json()

     if (data.success) {
       //router.push('/dashboard/${data.user_id}')
       router.push('/dashboard')
       router.refresh() 
     } else {
       setError('Invalid code. Please try again.')
     }
   } catch (err) {
     setError('Something went wrong. Please try again.')
   }

   setLoading(false)
 }

 const handleResend = async () => {
   setLoading(true)
   try {
     const response = await fetch('/api/auth/resend', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email })
     })
     
     if (response.ok) {
       setError('New code sent to your email')
       setCode(['', '', '', ''])
       inputs.current[0]?.focus()
     } else {
       setError('Failed to resend code')
     }
   } catch (err) {
     setError('Failed to resend code')
   }
   setLoading(false)
 }

 return (
   <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
     <div className="bg-background border border-foreground/10 rounded-lg p-6 max-w-md w-full relative">
       <button 
         onClick={onClose}
         className="absolute top-4 right-4 text-foreground/70 hover:text-foreground"
       >
         <X className="h-5 w-5" />
       </button>

       <h2 className="text-xl font-semibold mb-2">
         {isExistingUser ? 'Welcome Back!' : 'Enter Access Code'}
       </h2>

       {message && (
         <p className="text-foreground/70 mb-2">{message}</p>
       )}
       
       <p className="text-foreground/70 mb-6">
         {isExistingUser 
           ? 'Enter the access code sent to your email to sign in'
           : `We've sent a 4-digit code to ${email}`
         }
       </p>

       <div className="flex gap-2 mb-6 justify-center">
         {[0, 1, 2, 3].map((i) => (
           <input
             key={i}
             ref={el => { inputs.current[i] = el }}
             type="text"
             inputMode="numeric"
             maxLength={1}
             value={code[i]}
             onChange={(e) => handleInput(i, e.target.value)}
             onKeyDown={(e) => handleKeyDown(i, e)}
             className="w-14 h-14 text-center text-2xl border border-foreground/20 
               rounded-lg bg-background text-foreground focus:outline-none 
               focus:border-foreground/50"
           />
         ))}
       </div>

       {error && (
         <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
       )}

       <div className="space-y-3">
         <Button 
           fullWidth 
           onClick={handleSubmit}
           disabled={loading || code.join('').length !== 4}
         >
           {loading ? 'Verifying...' : 'Continue'}
         </Button>
         
         <Button 
           fullWidth 
           variant="ghost" 
           onClick={handleResend}
           disabled={loading}
         >
           Resend Code
         </Button>
       </div>
     </div>
   </div>
 )
}