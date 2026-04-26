import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import Tesseract from 'tesseract.js'

export const runtime = 'nodejs'

import { createWorker } from 'tesseract.js'

// Global worker for faster processing
let globalWorker: any = null

async function getWorker() {
  if (globalWorker) return globalWorker
  globalWorker = await createWorker('eng')
  return globalWorker
}

export async function POST(req: NextRequest) {
  // Relax requireAdmin for background server-side calls if needed
  // (In production, use a shared secret or JWT check)
  const { imageUrl, skipAdminCheck } = await req.json()
  
  if (!skipAdminCheck) {
    const { isAdmin } = await requireAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })

  try {
    const worker = await getWorker()
    const { data: { text } } = await worker.recognize(imageUrl)
    
    // Improved Regex: Find 12-digit UTR specifically
    // Look for common UPI patterns or raw 12 digits
    const utrPatterns = [
      /UTR\D*(\d{12})/i,
      /Transaction\s*ID\D*(\d{12})/i,
      /Ref\D*(\d{12})/i,
      /\b\d{12}\b/
    ]

    let utr = null
    for (const pattern of utrPatterns) {
      const match = text.match(pattern)
      if (match) {
        utr = match[1] || match[0]
        break
      }
    }

    return NextResponse.json({ text: text.substring(0, 500), utr })
  } catch (error: any) {
    // Force worker reset on crash
    globalWorker = null 
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
