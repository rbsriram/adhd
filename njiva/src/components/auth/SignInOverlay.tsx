// components/auth/SignInOverlay.tsx
'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'
import { validateEmail } from '@/lib/utils/validation'
import AccessCodeOverlay from './AccessCodeOverlay'

interface SignInOverlayProps {
  onClose: () => void
}

export default function SignInOverlay({ onClose }: SignInOverlayProps) {
  const [email, setEmail] = useState('')
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email) || loading) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setShowAccessCode(true)
      } else {
        setError(data.error || 'Account not found. Please sign up first.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (showAccessCode) {
    return (
      <AccessCodeOverlay 
        email={email}
        onClose={onClose}
        isExistingUser={true}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-foreground/10 rounded-lg p-6 max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/70 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-2">Sign In</h2>
        <p className="text-foreground/70 mb-6">
          Enter your email to receive an access code
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />
          <Button 
            fullWidth 
            disabled={!validateEmail(email) || loading}
          >
            {loading ? 'Sending...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}