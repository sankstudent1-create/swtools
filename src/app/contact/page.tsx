/* eslint-disable react/no-unescaped-entities */

'use client'

import React, { useState } from 'react';
import { MessageSquare, Globe, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError(null)
    setOk(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error || 'Failed to submit')
      setOk(true)
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400 text-center">
          Contact Us
        </h1>
        <p className="text-center text-white/60 mb-12 text-lg">
          Have questions or suggestions? We'd love to hear from you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-fuchsia-400 w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-white/50">Submit your query via the form below</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Website</h3>
            <p className="text-sm text-white/50">tools.swinfosystems.online</p>
          </div>
        </div>

        <div className="mt-10 p-8 bg-white/5 rounded-2xl border border-white/5">
          {error ? (
            <div className="mb-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          ) : null}

          {ok ? (
            <div className="mb-4 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Submitted successfully.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20"
                placeholder="Phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-white/60 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20"
                placeholder="Write your message..."
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={submit}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {busy ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
