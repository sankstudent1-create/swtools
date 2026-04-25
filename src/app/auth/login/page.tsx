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
      <div className="w-full max-w-md ui-modal-shell p-8">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="mt-2 text-sm text-white/60">Log in to your account to continue</p>

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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-white/70">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:underline">
                Forgot?
              </Link>
            </div>
            <input
              className="ui-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="ui-btn-primary w-full"
            onClick={onLogin}
            disabled={busy || !email || !password}
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-white/60">
          New here?{' '}
          <Link className="text-blue-400 hover:underline font-medium" href={`/auth/signup?next=${encodeURIComponent(nextUrl)}`}>
            Create an account
          </Link>
        </div>
      </div>
    </main>
  )
}
