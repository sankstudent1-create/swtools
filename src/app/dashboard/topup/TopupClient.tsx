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
            {config?.manual_enabled && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Manual UPI Option</div>
                  <div className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">Verified Flow</div>
                </div>
                <div className="flex items-center justify-between gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="font-mono text-sm text-white/80 break-all">{config?.upi_id || UPI_ID}</div>
                  <button
                    type="button"
                    className="ui-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-2"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(config?.upi_id || UPI_ID)
                        setSubmitMsg('UPI ID copied')
                      } catch {
                        setMsg({ text: 'Copy failed', type: 'error' })
                      }
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-white/10 shadow-2xl shadow-white/5 group transition-all hover:scale-[1.02]">
                  <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-px w-8 bg-black/10" />
                    <div className="text-[10px] font-mono text-black/40 uppercase tracking-widest">Scan with any App</div>
                    <div className="h-px w-8 bg-black/10" />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a 
                    href={upiLink}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Open App
                  </a>
                  <button 
                    onClick={() => {
                      const amountStr = amount.toFixed(2);
                      const note = `Topup_${amountStr}INR_${creditsPerInr}rate_${userEmail ?? ''}_${userId}`;
                      alert(`Manual Transfer Details:\n\nUPI ID: ${config?.upi_id || UPI_ID}\nAmount: ₹${amountStr}\nNote: ${note}\n\nPlease transfer exactly ₹${amountStr} and submit the UTR below.`);
                    }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Transfer Info
                  </button>
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

            {config?.manual_enabled && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-white/60" />
                  Submit Manual Proof
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 ml-1">Manual Amount (₹)</label>
                    <div className="relative group">
                      <input 
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-black italic text-blue-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10 uppercase tracking-widest">INR</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 ml-1">UTR Number</label>
                    <input
                      className="ui-input"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      placeholder="Enter 12-18 digit UTR"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 ml-1">Payment Screenshot</label>
                    <div className="relative group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full py-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${screenshot ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-500/5'}`}>
                        {screenshot ? (
                          <>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Proof Selected</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-white/20 group-hover:text-blue-500 transition-colors" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">Select Proof Image</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {screenshotPreview ? (
                      <div className="mt-3 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                        <img src={screenshotPreview} alt="Preview" className="w-full h-auto" />
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  className="w-full py-4 mt-6 rounded-[2rem] bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  onClick={submitTopupRequest}
                  disabled={submitBusy || (!utr.trim() && !screenshot) || amount < 1}
                >
                  {submitBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitBusy ? 'Processing...' : 'Verify Manual Transfer'}
                </button>

                <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500/70 font-bold leading-relaxed uppercase tracking-tighter">
                    Manual verification can take 5-30 minutes. Ensure the UTR and amount are exact for faster approval.
                  </p>
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
