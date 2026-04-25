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
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
        <h1 className="text-xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-white/60">Sign up with email and password.</p>

        <div className="mt-6 space-y-3">
          <input
            className="ui-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />
          <input
            className="ui-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            autoComplete="new-password"
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="ui-btn-primary w-full"
            onClick={onSignup}
            disabled={busy || !email || password.length < 6}
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </div>

        <p className="mt-4 text-sm text-white/60">
          Already have an account?{' '}
          <Link className="underline" href={`/auth/login?next=${encodeURIComponent(nextUrl)}`}>Login</Link>
        </p>
      </div>
    </main>
  )
}
