'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/tools/td-commission'

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onLogin = async () => {
    setBusy(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
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
        <h1 className="text-xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-white/60">Use your email and password to continue.</p>

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
            placeholder="Password"
            autoComplete="current-password"
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="ui-btn-primary w-full"
            onClick={onLogin}
            disabled={busy || !email || !password}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <p className="mt-4 text-sm text-white/60">
          Don&apos;t have an account?{' '}
          <Link className="underline" href={`/auth/signup?next=${encodeURIComponent(nextUrl)}`}>Create one</Link>
        </p>
      </div>
    </main>
  )
}
