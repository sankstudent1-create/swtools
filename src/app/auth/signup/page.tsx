'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/tools/td-commission'

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSignup = async () => {
    setBusy(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })

      if (err) {
        setError(err.message)
        return
      }

      window.location.href = nextUrl
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md ui-modal-shell p-8">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="mt-2 text-sm text-white/60">Join us to start using our professional tools</p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
            <input
              className="ui-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
            <input
              className="ui-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <p className="mt-1 text-[10px] text-white/40 italic">Minimum 6 characters required</p>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="ui-btn-primary w-full"
            onClick={onSignup}
            disabled={busy || !email || password.length < 6}
          >
            {busy ? 'Creating Account…' : 'Create Account'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link className="text-blue-400 hover:underline font-medium" href={`/auth/login?next=${encodeURIComponent(nextUrl)}`}>
            Sign in instead
          </Link>
        </div>
      </div>
    </main>
  )
}
