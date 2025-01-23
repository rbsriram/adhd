// app/(auth)/verify/page.tsx
'use client'
console.log("************************app/(auth)/verify/page.tsx***************************");
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function VerifyPage() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const email = searchParams.get('email')
 const [code, setCode] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 async function handleSubmit(e: React.FormEvent) {
   e.preventDefault()
   setLoading(true)
   setError('')

   try {
     console.log(`[VERIFY] Submitting access code for email: ${email}`)
     const response = await fetch('/api/auth/verify', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, code })
     })

     const data = await response.json()
     console.log(`[VERIFY] Server response:`, data)

     if (data.success) {
       console.log(`[VERIFY] Access code verified successfully for email: ${email}`)
       router.push('/dashboard')
     } else {
       console.error(`[VERIFY] Invalid access code for email: ${email}`)
       setError('Invalid code. Please try again.')
     }
   } catch (err) {
     console.error(`[VERIFY] Error verifying access code for email: ${email}`, err)
     setError('Something went wrong. Please try again.')
   }

   setLoading(false)
 }

 if (!email) {
  console.warn(`[VERIFY] No email found in query parameters. Redirecting to landing page ("/").`)
  router.push('/')
  return null
}

 return (
   <div className="min-h-screen flex flex-col items-center justify-center px-4">
     <div className="w-full max-w-md">
       <div className="text-center mb-8">
         <Logo size="lg" className="mb-6" />
         <h1 className="text-2xl font-bold mb-2">Enter Access Code</h1>
         <p className="text-gray-600">
           Check your email for a 4-digit access code
         </p>
       </div>

       <form onSubmit={handleSubmit} className="space-y-4">
         <Input
           type="text"
           inputMode="numeric"
           pattern="[0-9]*"
           maxLength={4}
           value={code}
           onChange={(e) => setCode(e.target.value)}
           placeholder="Access code"
           required
           error={error}
         />
         <Button fullWidth disabled={loading}>
           {loading ? 'Verifying...' : 'Continue'}
         </Button>
       </form>
     </div>
   </div>
 )
}
