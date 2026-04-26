'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  Wallet,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  QrCode,
  Copy,
  Send,
  CheckCircle2,
  Upload,
  FileText,
  Smartphone,
} from 'lucide-react'

const PRICING_PLANS = [
  { amount: 99, credits: 100, tag: 'Starter' },
  { amount: 199, credits: 250, tag: 'Best Value', popular: true },
  { amount: 499, credits: 700, tag: 'Pro' },
]

type Props = {
  userId: string
  userEmail: string | null
}

export default function TopupClient({ userId, userEmail }: Props) {
  const supabase = useMemo(() => {
    const client = createSupabaseBrowserClient()
    // TEMPORARY: Expose for console debugging
    if (typeof window !== 'undefined') {
      (window as any).supabase = client
    }
    return client
  }, [])

  const [amount, setAmount] = useState<number>(199)
  const [error, setError] = useState<string | null>(null)
  const [creditsPerInr, setCreditsPerInr] = useState<number>(1)

  const [config, setConfig] = useState<{
    method: 'manual' | 'razorpay' | 'both',
    razorpay_enabled: boolean,
    manual_enabled: boolean,
    upi_id: string,
    credits_per_inr: number,
    razorpay_available: boolean
  } | null>(null)

  useEffect(() => {
    async function loadConfig() {
      const res = await fetch('/api/admin/payment-config')
      const j = await res.json()
      if (res.ok) {
        setConfig(j)
        if (j.credits_per_inr) setCreditsPerInr(j.credits_per_inr)
      }
    }
    loadConfig()
  }, [])

  const startRazorpayPayment = async () => {
    setSubmitBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/wallet/topup/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: amount })
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error || 'Failed to create order')

      const options = {
        key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SW Info Systems',
        description: `Topup ${Math.floor(amount * creditsPerInr)} Credits`,
        order_id: order.id,
        handler: async function (response: any) {
          setSubmitMsg('Verifying payment...')
          const verifyRes = await fetch('/api/wallet/topup/razorpay-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount_inr: amount,
              credits: Math.floor(amount * creditsPerInr)
            })
          })
          const verifyData = await verifyRes.json()
          if (verifyRes.ok) {
            setSubmitMsg('Payment successful! Credits added to your wallet.')
            // Trigger a balance refresh if needed or redirect
          } else {
            setError(verifyData.error || 'Payment verification failed')
          }
          setSubmitBusy(false)
        },
        prefill: {
          email: userEmail,
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setSubmitBusy(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.message)
      setSubmitBusy(false)
    }
  }
  const [utr, setUtr] = useState('')
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  // --- NEW SCRATCH SCREENSHOT UPLOAD LOGIC ---
  const [debugLog, setDebugLog] = useState<string[]>([])
  
  const submitTopupRequest = async () => {
    if (!screenshot && !utr.trim()) return
    setSubmitBusy(true)
    setError(null)
    setSubmitMsg(null)

    try {
      let finalScreenshotPath: string | null = null
      let fileToUpload = screenshot
      
      if (fileToUpload) {
        setSubmitMsg('Optimizing proof...')
        try {
          fileToUpload = await normalizeScreenshot(fileToUpload)
        } catch (e) {
          console.error('[topup] Compression failed, using original', e)
        }

        setSubmitMsg('Uploading proof...')
        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('amount', amount.toString())
        formData.append('utr', utr.trim() || `pending_ocr_${Date.now()}`)
        formData.append('credits', Math.floor(amount * creditsPerInr).toString())

        const res = await fetch('/api/wallet/topup/upload-proof', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const j = await res.json()
          throw new Error(j.error || 'Upload failed')
        }
        const data = await res.json()
        finalScreenshotPath = data.path
      } else {
        // UTR only submission
        setSubmitMsg('Submitting details...')
        const res = await fetch('/api/wallet/topup/manual-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount_inr: amount,
            utr: utr.trim(),
            credits_requested: Math.floor(amount * creditsPerInr),
            screenshot_path: null,
          }),
        })
        if (!res.ok) {
          const j = await res.json()
          throw new Error(j.error || 'Submission failed')
        }
      }

      setSubmitMsg('Submitted successfully! Our team will verify and approve your credits soon.')
      setUtr('')
      setScreenshot(null)
      setScreenshotPreview(null)
    } catch (e: any) {
      setError(e.message || 'Failed to submit request')
    } finally {
      setSubmitBusy(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadRate() {
      try {
        const res = await fetch('/api/wallet/topup/rate', { method: 'GET' })
        const j = await res.json().catch(() => null)
        if (!cancelled && res.ok) {
          const v = Number(j?.credits_per_inr)
          if (Number.isFinite(v) && v > 0) setCreditsPerInr(v)
        }
      } catch {
        // ignore
      }
    }
    loadRate()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!screenshot) {
      setScreenshotPreview(null)
      return
    }
    const url = URL.createObjectURL(screenshot)
    setScreenshotPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [screenshot])

  const normalizeScreenshot = async (file: File): Promise<File> => {
    const MAX_DIM = 1600
    const JPEG_QUALITY = 0.82

    if (!file.type.startsWith('image/')) return file
    if (file.size <= 700_000) return file

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Image encode failed'))),
        'image/jpeg',
        JPEG_QUALITY
      )
    })

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  }

  const UPI_ID = 'swinfosystems@nyes'

  const upiLink = useMemo(() => {
    const am = Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : '0.00'
    const note = `Topup_${am}INR_${creditsPerInr}rate_${userEmail ?? ''}_${userId}`
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'SW Info Systems',
      am,
      cu: 'INR',
      tn: note,
    })
    return `upi://pay?${params.toString()}`
  }, [amount, creditsPerInr, userEmail, userId])

  const qrUrl = useMemo(() => {
    const data = encodeURIComponent(upiLink)
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`
  }, [upiLink])

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Manual Verification
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Top Up Your Wallet
          </h1>
          <p className="text-white/40 mt-2">Pay via UPI, then submit UTR/screenshot for manual approval</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PRICING_PLANS.map((plan) => (
            <button
              key={plan.amount}
              onClick={() => setAmount(plan.amount)}
              className={`relative ui-modal-shell p-6 text-left transition-all duration-300 group ${
                amount === plan.amount
                  ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/50'
                  : 'hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">
                  Most Popular
                </div>
              )}
              <div className="text-xs font-bold text-white/40 uppercase mb-1">{plan.tag}</div>
              <div className="text-2xl font-bold mb-1">₹{plan.amount}</div>
              <div className="text-sm text-white/60">{plan.credits} Credits</div>
            </button>
          ))}
        </div>

        <div className="ui-modal-shell p-8 max-w-xl mx-auto">
          <div className="space-y-6">
            {(!config || config.manual_enabled) && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Pay to UPI</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="font-mono text-sm text-white/80 break-all">{config?.upi_id || UPI_ID}</div>
                  <button
                    type="button"
                    className="ui-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-2"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(config?.upi_id || UPI_ID)
                        setSubmitMsg('UPI ID copied')
                      } catch {
                        setSubmitMsg('Copy failed')
                      }
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
              </div>
            )}

            {(!config || config.manual_enabled) && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-white/60" />
                    Dynamic QR (Scan to Pay)
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <a className="text-xs text-blue-400 hover:text-blue-300 font-medium" href={upiLink}>
                      Open UPI App
                    </a>
                  </div>
                </div>
                <div className="mt-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-white/10 shadow-2xl shadow-white/5">
                  <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
                  <div className="mt-4 text-[10px] font-mono text-black/40 bg-black/5 px-2 py-1 rounded">
                    Amount: ₹{amount} | Credits: {Math.floor(amount * creditsPerInr)}
                  </div>
                </div>
              </div>
            )}

            {config?.razorpay_enabled && config.razorpay_available && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                 <div className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Instant Payment (Razorpay)
                </div>
                <button
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] hover:bg-emerald-600 transition-all disabled:opacity-50"
                  onClick={startRazorpayPayment}
                  disabled={submitBusy}
                >
                  {submitBusy ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                  Pay ₹{amount} Instantly
                </button>
                <div className="mt-3 text-[10px] text-white/30 text-center uppercase tracking-widest">
                  Instant Credit Addition
                </div>
              </div>
            )}

            {error ? (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
                {error}
              </div>
            ) : null}

            {submitMsg ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {submitMsg}
              </div>
            ) : null}

            {(!config || config.manual_enabled) && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-white/60" />
                  Submit Manual Proof
                </div>

                <label className="block text-xs text-white/50 mb-2">UTR (optional if screenshot uploaded)</label>
                <input
                  className="ui-input"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="Enter 12-18 digit UTR"
                />

                <div className="mt-4">
                  <label className="block text-xs text-white/50 mb-2">Screenshot (optional if UTR provided)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-white/60"
                  />
                  
                  {screenshotPreview ? (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                      <img src={screenshotPreview} alt="Preview" className="w-full h-auto" />
                    </div>
                  ) : null}
                </div>

                <button
                  className="ui-btn-primary w-full mt-5 inline-flex items-center justify-center gap-2"
                  onClick={submitTopupRequest}
                  disabled={submitBusy || (!utr.trim() && !screenshot)}
                >
                  {submitBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitBusy ? 'Submitting…' : 'Submit for Verification'}
                </button>

                <div className="mt-3 text-[11px] text-white/40 uppercase tracking-widest font-black">
                  Manual Approval required
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-xs text-white/40">
              Credits are added after manual verification.
            </div>
          </div>
        </div>

        <div className="mt-10 ui-modal-shell p-6 max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-white">Need help?</div>
              <div className="text-sm text-white/50 mt-1">
                If your request is not approved within some time, contact support with your UTR and email.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
