"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/auth" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
          <p className="text-white/40 text-sm mb-8">Enter your email and we'll send you a link to reset your password.</p>

          {message && (
            <div className={`mb-6 p-4 rounded-2xl text-sm border ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
