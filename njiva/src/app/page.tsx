// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/ui/Logo'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { validateEmail, validateName } from '@/lib/utils/validation'
import AccessCodeOverlay from '@/components/auth/AccessCodeOverlay'
import SignInOverlay from '@/components/auth/SignInOverlay'
console.log(`[LANDINGPAGE.TSX] Mounted**********************`);
export default function LandingPage() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [message, setMessage] = useState('')
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsValid(validateEmail(email) && validateName(firstName))
  }, [email, firstName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          firstName: firstName.trim() 
        })
      })

      const data = await response.json()
      if (response.ok) {
        setShowAccessCode(true)
        setMessage(data.message || '')
        setIsExistingUser(!!data.isExistingUser)
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Existing Sign In button in top-right corner */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost"
          onClick={() => setShowSignIn(true)}
        >
          Sign In
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Logo / Title */}
        <div className="flex justify-center transition-all duration-500 mb-8 pt-16">
          <Logo size="lg" />
        </div>

        <header className="text-center px-4 pb-12">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Think it. Type it. We Organize it.
          </h1>
          <p className="text-lg text-foreground/70">
            njiva turns your scattered thoughts into a masterpiece of productivity.
          </p>
        </header>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="px-4">
          <div className="px-4">
            <div className="max-w-md mx-auto space-y-4">
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                fullWidth 
                type="submit"
                disabled={!isValid || loading}
              >
                {loading ? 'Processing...' : 'Get Started'}
              </Button>

              {/* Subtle sign-in link for returning users */}
              <p className="text-center mt-4 text-sm text-foreground/70">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setShowSignIn(true)}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>  
        </form>
      </div>

      {/* Modals */}
      {showSignIn && (
        <SignInOverlay onClose={() => setShowSignIn(false)} />
      )}
      {showAccessCode && (
        <AccessCodeOverlay 
          email={email}
          onClose={() => setShowAccessCode(false)}
          isExistingUser={isExistingUser}
          message={message}
        />
      )}
    </div>
  )
}
