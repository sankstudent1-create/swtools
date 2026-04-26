'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

type ContactMessage = {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  message: string
  status: 'open' | 'replied' | 'closed'
  admin_reply: string | null
  created_at: string
  replied_at: string | null
  replied_by: string | null
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/contact-messages')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to load')
      setMessages(j.messages || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const openCount = useMemo(() => messages.filter(m => m.status === 'open').length, [messages])

  const sendReply = async (id: string) => {
    const reply = String(replyDrafts[id] ?? '').trim()
    if (!reply) {
      setToast({ ok: false, text: 'Reply is empty' })
      return
    }

    setBusyId(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reply, status: 'replied' }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed')

      setToast({ ok: true, text: 'Reply saved' })
      await load()
    } catch (e) {
      setToast({ ok: false, text: e instanceof Error ? e.message : 'Failed' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Admin
          </Link>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Open: <span className="text-white">{openCount}</span>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-white">Contact Messages</h1>
          <p className="text-white/40 mt-2">View and reply to messages submitted from the Contact page.</p>
        </div>

        {toast ? (
          <div className={`mb-6 p-3 rounded-2xl border text-sm flex items-center gap-2 ${toast.ok ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
            {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.text}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">{error}</div>
        ) : null}

        {loading ? (
          <div className="ui-modal-shell p-10 text-center">
            <Loader2 className="w-5 h-5 animate-spin inline" />
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <div key={m.id} className="ui-modal-shell p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="inline-flex items-center gap-2 text-white font-semibold">
                        <User className="w-4 h-4 text-white/40" />
                        {m.name}
                      </div>
                      <div className="inline-flex items-center gap-2 text-white/70 text-sm">
                        <Mail className="w-4 h-4 text-white/30" />
                        {m.email}
                      </div>
                      {m.phone ? (
                        <div className="inline-flex items-center gap-2 text-white/60 text-sm">
                          <Phone className="w-4 h-4 text-white/30" />
                          {m.phone}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs text-white/30">
                      {new Date(m.created_at).toLocaleString('en-IN')}
                      {' · '}
                      <span className={m.status === 'open' ? 'text-amber-300' : m.status === 'replied' ? 'text-emerald-300' : 'text-white/40'}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </div>
                  <div className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</div>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Reply</div>
                    <textarea
                      value={replyDrafts[m.id] ?? m.admin_reply ?? ''}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white/80 focus:outline-none focus:border-blue-500/50"
                      placeholder="Type reply..."
                    />
                    <div className="mt-3">
                      <button
                        className="ui-btn-primary w-full inline-flex items-center justify-center gap-2"
                        onClick={() => sendReply(m.id)}
                        disabled={busyId === m.id}
                      >
                        {busyId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Save Reply
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Latest Saved Reply</div>
                    <div className="text-white/70 whitespace-pre-wrap text-sm min-h-[6rem]">
                      {m.admin_reply ? m.admin_reply : 'No reply yet'}
                    </div>
                    <div className="mt-2 text-xs text-white/30">
                      {m.replied_at ? `Saved: ${new Date(m.replied_at).toLocaleString('en-IN')}` : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 ? (
              <div className="ui-modal-shell p-10 text-center text-white/40">No messages yet.</div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
