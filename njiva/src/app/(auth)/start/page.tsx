// app/(auth)/start/page.tsx
'use client'
console.log("***********************app/(auth)/start/page.tsx***************************");
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { authService } from '@/lib/services/authService'

export default function StartPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await authService.startAuth(email)
    
    if (result.success) {
      router.push(`/verify?email=${encodeURIComponent(email)}`)
    } else {
      setError(result.error || 'Something went wrong')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="mb-6" />
          <h1 className="text-2xl font-bold mb-2">Welcome to njiva</h1>
          <p className="text-gray-600">Enter your email to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            required
            error={error}
          />
          <Button 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Continue with Email'}
          </Button>
        </form>
      </div>
    </div>
  )
}