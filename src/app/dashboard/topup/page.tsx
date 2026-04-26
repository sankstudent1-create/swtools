'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Wallet, ShieldCheck, ArrowLeft, Loader2, QrCode, Copy, Send, CheckCircle2, Upload, FileText, Smartphone } from 'lucide-react'

const PRICING_PLANS = [
  { amount: 99, credits: 100, tag: 'Starter' },
  { amount: 199, credits: 250, tag: 'Best Value', popular: true },
  { amount: 499, credits: 700, tag: 'Pro' },
]

export default function TopupPage() {
  const [supabase, setSupabase] = useState<any>(null)

  const [amount, setAmount] = useState<number>(199)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [creditsPerInr, setCreditsPerInr] = useState<number>(1)
  const [utr, setUtr] = useState('')
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  const [user, setUser] = useState<any>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    try {
      setSupabase(createSupabaseBrowserClient())
    } catch (e: any) {
      setError(e?.message || 'Supabase is not configured')
      setAuthReady(true)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    const safeSet = (fn: () => void) => {
      if (cancelled) return
      fn()
    }

    const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
      return await Promise.race([
        p,
        new Promise<T>((_resolve, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out`)), ms)
        ),
      ])
    }

    const sub: any = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        safeSet(() => {
          setUser(session.user)
          setAuthReady(true)
        })
      }
    })

    ;(async () => {
      try {
        const res: any = await withTimeout(supabase.auth.getSession(), 12000, 'Auth check')
        const data = res?.data
        const authError = res?.error

        if (authError) {
          safeSet(() => {
            setError(authError?.message || 'Authentication error')
            setAuthReady(true)
          })
          return
        }

        const session = data?.session
        if (!session) {
          window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
          return
        }

        safeSet(() => {
          setUser(session.user)
          setAuthReady(true)
        })
      } catch (e: any) {
        safeSet(() => {
          setError(e?.message || 'Failed to load authentication')
          setAuthReady(true)
        })
      }
    })()

    return () => {
      cancelled = true
      try {
        sub?.data?.subscription?.unsubscribe?.()
      } catch {
        // ignore
      }
    }
  }, [supabase])

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

  const UPI_ID = 'swinfosystems@nyes'

  const upiLink = useMemo(() => {
    if (!user) return ''
    const am = Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : '0.00'
    // Embed user details and transaction info in the UPI note (tn)
    const userEmail = user?.email || ''
    const userId = user?.id || ''
    const note = `Topup_${am}INR_${creditsPerInr}rate_${userEmail}_${userId}`
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'SW Info Systems',
      am,
      cu: 'INR',
      tn: note,
    })
    return `upi://pay?${params.toString()}`
  }, [amount, creditsPerInr, user])

  const qrUrl = useMemo(() => {
    if (!upiLink) return ''
    const data = encodeURIComponent(upiLink)
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`
  }, [upiLink])

  const submitUtr = async () => {
    setSubmitBusy(true)
    setError(null)
    setSubmitMsg(null)
    try {
      if (!supabase) {
        setError('Supabase is not configured')
        return
      }
      const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
        return await Promise.race([
          p,
          new Promise<T>((_resolve, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out`)), ms)
          ),
        ])
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }

      let screenshotPath = null
      if (screenshot) {
        setSubmitMsg('Uploading screenshot...')
        const fileExt = screenshot.name.split('.').pop()
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`
        
        // Ensure bucket existence doesn't block the UI - the bucket check script was run
        const uploadRes = await withTimeout(
          supabase.storage
            .from('topup-screenshots')
            .upload(fileName, screenshot, {
              cacheControl: '3600',
              upsert: false,
            }),
          30000,
          'Screenshot upload'
        ) as any
        const uploadData = uploadRes?.data
        const uploadError = uploadRes?.error

        if (uploadError) {
          console.error('Upload error details:', uploadError)
          // Fallback: If upload fails, we still try to submit the UTR but warn the user
          setError(`Screenshot upload failed, but you can try submitting just the UTR. Error: ${uploadError.message}`)
          return 
        }
        screenshotPath = uploadData.path
      }

      setSubmitMsg('Submitting details...')

      const res = await withTimeout(
        fetch('/api/wallet/topup/manual-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount_inr: amount,
            utr: utr.trim() || null,
            credits_requested: Math.floor(amount * creditsPerInr),
            screenshot_path: screenshotPath,
          }),
        }),
        20000,
        'Request submission'
      )

      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }

      const j = await res.json().catch(() => null)
      if (!res.ok) {
        setError(j?.error || 'Failed to submit request')
        return
      }

      setSubmitMsg('Submitted successfully! Our team will verify the UTR/Screenshot and approve your credits soon.')
      setUtr('')
      setScreenshot(null)
      setScreenshotPreview(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to submit request')
    } finally {
      setSubmitBusy(false)
    }
  }

  if (!authReady) {
    return (
      <main className="min-h-screen px-4 py-24 bg-[#07090f]">
        <div className="mx-auto max-w-3xl">
          <div className="ui-modal-shell p-8 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-white/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading…
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
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
          <p className="text-white/40 mt-2">Pay via UPI, then submit UTR for manual approval</p>
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
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Pay to UPI</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="font-mono text-sm text-white/80 break-all">{UPI_ID}</div>
                <button
                  type="button"
                  className="ui-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-2"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(UPI_ID)
                      setSubmitMsg('UPI ID copied')
                    } catch {
                      setSubmitMsg('Copy failed')
                    }
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Custom Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">₹</span>
                <input
                  className="ui-input pl-8 text-lg font-mono"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e: any) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
              <p className="mt-2 text-[11px] text-white/30 italic italic">Approx. {amount * creditsPerInr} credits will be added</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-white/60" />
                  Dynamic QR (Scan to Pay)
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <a
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    href={upiLink || '#'}
                    aria-disabled={!upiLink}
                    onClick={(e: any) => {
                      if (!upiLink) e.preventDefault()
                    }}
                  >
                    Open UPI App
                  </a>
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-white/10 shadow-2xl shadow-white/5">
                {qrUrl ? (
                  <>
                    <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
                    <div className="mt-4 text-[10px] font-mono text-black/40 bg-black/5 px-2 py-1 rounded">
                      Amount: ₹{amount} | Credits: {Math.floor(amount * creditsPerInr)}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-black/50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing QR…
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">UPI Payment Details</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px]">
                    <span className="block text-white/30 mb-0.5">VPA</span>
                    <span className="text-white/80 font-mono truncate">{UPI_ID}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px]">
                    <span className="block text-white/30 mb-0.5">NAME</span>
                    <span className="text-white/80 truncate uppercase">SW Info Systems</span>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </div>
            ) : null}

            {submitMsg ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {submitMsg}
              </div>
            ) : null}

            <div className="mt-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white/60" />
                  Payment Verification
                </div>
              </div>
              
              <div className="text-xs text-white/50 leading-relaxed bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                After successful payment, please provide the 12-digit UTR number and a screenshot of the payment for faster approval.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">UTR / Transaction ID</label>
                  <input
                    className="ui-input font-mono text-sm"
                    value={utr}
                    onChange={(e: any) => setUtr(String(e.target.value))}
                    placeholder="Enter 12-digit UTR number"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Payment Screenshot (Optional)</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 group ${
                      screenshotPreview ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e: any) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setScreenshot(file)
                          setScreenshotPreview(URL.createObjectURL(file))
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      {screenshotPreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-emerald-500/20">
                          <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">Click to change</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 rounded-full bg-white/5">
                            <Upload className="w-5 h-5 text-white/40" />
                          </div>
                          <div className="text-xs text-white/40">Click or drag to upload screenshot</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="ui-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-blue-500/10"
                disabled={submitBusy || amount <= 0 || (!utr.trim() && !screenshot)}
                onClick={submitUtr}
              >
                {submitBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Submission...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
              <div className="text-[11px] text-white/30">
                Current conversion rate: <span className="font-mono text-white/50">{creditsPerInr}</span> credits per ₹1
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center text-center">
              <p className="text-[10px] text-white/30 leading-relaxed max-w-xs">
                Payments are made via UPI. Credits are added after manual verification and approval.
              </p>
              <div className="flex items-center gap-4 grayscale opacity-40">
                {/* Placeholder for payment icons */}
                <div className="h-4 w-12 bg-white/10 rounded" />
                <div className="h-4 w-12 bg-white/10 rounded" />
                <div className="h-4 w-12 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
