'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { LogIn, Key, Mail, ArrowRight, ShieldCheck, Github } from 'lucide-react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/dashboard'

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

      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()
        if (profile?.role === 'admin') {
          window.location.href = '/admin'
          return
        }
      }

      window.location.href = nextUrl
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12 selection:bg-blue-500/30">
      <div className="w-full max-w-[440px] relative">
        {/* Abstract Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 mb-6 shadow-xl shadow-blue-500/20 rotate-3 group hover:rotate-0 transition-all duration-500">
              <img src="/brand/sw-logo-mark.svg" alt="SW Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-3 italic uppercase leading-none">
              Welcome <span className="text-blue-500">Back</span>
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-tight uppercase tracking-[0.1em]">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-blue-500 transition-colors ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all placeholder:text-white/10 font-medium"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-blue-500 transition-colors">Password</label>
                <Link href="/auth/forgot-password" title="Forgot Password?" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-blue-400 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all placeholder:text-white/10 font-medium"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] hover:bg-blue-600 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
              onClick={onLogin}
              disabled={busy || !email || !password}
            >
              {busy ? 'Authenticating...' : (
                <>
                  Sign In Now
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-white/30 text-xs font-bold tracking-tight uppercase">
              New to SWTools?{' '}
              <Link className="text-blue-500 hover:text-blue-400 transition-colors ml-1" href={`/auth/signup?next=${encodeURIComponent(nextUrl)}`}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
