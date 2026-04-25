'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AdminPricingPage() {
  const [credits, setCredits] = useState<number>(10)
  const [active, setActive] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const save = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/pricing/td-commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ download_credits: credits, is_active: active }),
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
          <h1 className="text-2xl font-bold">Tool Pricing</h1>
          <Link className="ui-btn-secondary" href="/admin">Back</Link>
        </div>

        <div className="mt-6 ui-modal-shell p-6 space-y-4">
          <div>
            <div className="text-sm text-white/70">TD Commission</div>
            <div className="mt-2 grid gap-3">
              <label className="text-sm text-white/70">Download credits</label>
              <input className="ui-input" type="number" min={1} value={credits} onChange={e => setCredits(Number(e.target.value))} />

              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                Active
              </label>
            </div>
          </div>

          {msg ? <p className="text-sm text-white/70">{msg}</p> : null}

          <button className="ui-btn-primary w-full" onClick={save} disabled={busy || credits <= 0}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </main>
  )
}
