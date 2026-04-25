'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    Razorpay?: any
  }
}

export default function TopupPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [amount, setAmount] = useState<number>(199)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startTopup = async () => {
    setBusy(true)
    setError(null)

    try {
      // Ensure session exists (creates cookies)
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }

      const res = await fetch('/api/wallet/topup/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: amount }),
      })

      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        setError(j?.error || 'Failed to create order')
        return
      }

      const j = await res.json()

      if (!window.Razorpay) {
        setError('Razorpay checkout script not loaded')
        return
      }

      const options = {
        key: j.key_id,
        amount: j.amount_paise,
        currency: j.currency,
        order_id: j.order_id,
        name: 'SW Tools',
        description: 'Wallet Topup',
        handler: () => {
          // Final crediting happens by webhook. Just bring user back.
          window.location.href = '/dashboard'
        },
        theme: { color: '#10b981' },
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Topup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Top up wallet</h1>
          <Link className="ui-btn-secondary" href="/dashboard">Back</Link>
        </div>

        <div className="mt-6 ui-modal-shell p-6 space-y-4">
          <label className="block text-sm text-white/70">Amount (INR)</label>
          <input
            className="ui-input"
            type="number"
            min={1}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button className="ui-btn-primary w-full" onClick={startTopup} disabled={busy || amount <= 0}>
            {busy ? 'Starting…' : 'Pay with Razorpay'}
          </button>

          <p className="text-xs text-white/50">
            Credits will be added after payment verification (webhook). If your credits don’t update immediately, refresh after 10-20 seconds.
          </p>
        </div>
      </div>
    </main>
  )
}
