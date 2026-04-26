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
  const [utr, setUtr] = useState('')
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

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

  const submitUtr = async () => {
    setSubmitBusy(true)
    setError(null)
    setSubmitMsg(null)

    const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
      return await Promise.race([
        p,
        new Promise<T>((_resolve, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out`)), ms)
        ),
      ])
    }

    try {
      let screenshotPath: string | null = null
      if (screenshot) {
        setSubmitMsg('Verifying storage access...')
        // 1. Check Auth state explicitly
        const { data: { session }, error: authErr } = await supabase.auth.getSession()
        if (authErr || !session) {
          console.error('[topup] Auth check FAILED:', { authErr, session })
          setError(`Authentication error: Please log in again. (Detail: ${authErr?.message || 'No session'})`)
          return
        }
        console.log('[topup] Auth check SUCCESS:', { userId: session.user.id })

        // 2. Check Bucket existence
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('topup-screenshots')
        
        if (bucketError) {
          console.error('[topup] Bucket access check FAILED:', bucketError)
          setError(`Cannot access storage: ${bucketError.message}. Ensure the bucket 'topup-screenshots' exists and is Public.`)
          return
        }
        console.log('[topup] Bucket access check SUCCESS:', bucketData)

        setSubmitMsg('Uploading screenshot...')
        let fileToUpload = screenshot
        try {
          fileToUpload = await normalizeScreenshot(screenshot)
        } catch (e: any) {
          console.error('[topup] screenshot normalize failed', e)
        }

        if (fileToUpload.size > 8_000_000) {
          setError('Image is too large. Please upload a smaller screenshot (under 8MB).')
          return
        }

        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}.${fileExt}`

        // 1. Storage Upload
        const startTime = Date.now()
        console.log('[topup] Starting upload:', {
          fileName,
          fileSize: fileToUpload.size,
          fileType: fileToUpload.type,
          timestamp: new Date().toISOString()
        })

        const uploadRes = (await withTimeout(
          supabase.storage.from('topup-screenshots').upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
          }),
          90000,
          'Screenshot upload'
        )) as any

        const duration = Date.now() - startTime

        if (uploadRes?.error) {
          console.error('[topup] Upload FAILED:', {
            error: uploadRes.error,
            code: uploadRes.error?.code,
            statusCode: uploadRes.error?.status,
            message: uploadRes.error?.message,
            durationMs: duration,
            fileName,
            fileSize: fileToUpload.size,
            networkStatus: navigator.onLine ? 'online' : 'offline',
          })
          
          let userMsg = `Upload failed (${uploadRes.error.message || 'Unknown error'}).`
          if (duration >= 90000) {
            userMsg = `Upload timed out after 90s. Even small files can fail if the connection to storage is blocked.`
          }
          
          setError(
            `${userMsg} Please check if you have an ad-blocker or firewall blocking supabase.co, or try just submitting the UTR.`
          )
          return
        }

        console.log('[topup] Upload SUCCESS:', {
          durationMs: duration,
          path: uploadRes.data?.path,
          size: fileToUpload.size
        })

        screenshotPath = uploadRes?.data?.path ?? null
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

      setSubmitMsg('Submitted successfully! Our team will verify and approve your credits soon.')
      setUtr('')
      setScreenshot(null)
      setScreenshotPreview(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to submit request')
    } finally {
      setSubmitBusy(false)
    }
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
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
            </div>

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

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-white/60" />
                Submit Proof
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
                onClick={submitUtr}
                disabled={submitBusy || (!utr.trim() && !screenshot)}
              >
                {submitBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitBusy ? 'Submitting…' : 'Submit for Verification'}
              </button>

              <div className="mt-3 text-[11px] text-white/40">
                You can submit:
                <div>1) UTR only</div>
                <div>2) Screenshot only (OCR by admin)</div>
                <div>3) Both</div>
              </div>
            </div>

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
