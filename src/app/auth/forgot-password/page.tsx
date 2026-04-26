'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const supabase = createSupabaseBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage('Password reset link sent to your email.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12 selection:bg-blue-500/30">
      <div className="w-full max-w-[440px] relative">
        {/* Abstract Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3.5 group">
                <div className="relative w-14 h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_rgba(59,130,246,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img 
                    src="/icon-192.png" 
                    alt="SW Tools Logo" 
                    className="w-8 h-8 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="font-heading font-bold text-4xl tracking-tighter text-white flex items-center italic">
                  SW<span className="text-white/20 font-light ml-1 not-italic">Tools</span>
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-3 italic uppercase leading-none">
              Reset <span className="text-blue-500">Password</span>
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-tight uppercase tracking-[0.1em]">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2 group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-blue-500 transition-colors ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all placeholder:text-white/10 font-medium"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in fade-in flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {message && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-in fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] hover:bg-blue-600 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending link...' : (
                <>
                  Send Reset Link
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <Link href="/auth/login" className="text-white/30 text-xs font-bold tracking-tight uppercase hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
