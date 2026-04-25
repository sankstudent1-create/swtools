'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const [creditsPerInr, setCreditsPerInr] = useState<number>(1)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const save = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/settings/credits-per-inr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits_per_inr: creditsPerInr }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        setMsg(j?.error || 'Failed')
        return
      }
      setMsg('Saved')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <Link className="ui-btn-secondary" href="/admin">Back</Link>
        </div>

        <div className="mt-6 ui-modal-shell p-6 space-y-4">
          <label className="block text-sm text-white/70">Credits per ₹1</label>
          <input className="ui-input" type="number" min={1} value={creditsPerInr} onChange={e => setCreditsPerInr(Number(e.target.value))} />

          {msg ? <p className="text-sm text-white/70">{msg}</p> : null}

          <button className="ui-btn-primary w-full" onClick={save} disabled={busy || creditsPerInr <= 0}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </main>
  )
}
