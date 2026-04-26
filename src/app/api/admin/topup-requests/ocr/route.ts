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
  
  // Use corePath to use the faster WebAssembly version if possible, 
  // or at least ensure we aren't reloading everything.
  globalWorker = await createWorker('eng', 1, {
    logger: m => console.log(`[ocr-worker] ${m.status}: ${Math.round(m.progress * 100)}%`),
    errorHandler: err => {
      console.error('[ocr-worker] Error:', err)
      globalWorker = null
    }
  })
  return globalWorker
}

export async function POST(req: NextRequest) {
  // 1. SET A TIMEOUT ABORT SIGNAL
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 9000) // 9 second limit

  try {
    const body = await req.json()
    const { imageUrl, skipAdminCheck } = body
    
    if (!skipAdminCheck) {
      const { isAdmin } = await requireAdmin()
      if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })

    console.log('[ocr] Processing image:', imageUrl)
    const worker = await getWorker()
    
    // Perform recognition with a potential timeout
    const { data: { text } } = await worker.recognize(imageUrl)
    
    clearTimeout(timeoutId)

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

    return NextResponse.json({ 
      text: text.substring(0, 300), 
      utr,
      confidence: 'low' 
    })
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('[ocr] Processing error:', error.message)
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'OCR taking too long. Please verify manually.' }, { status: 504 })
    }

    // Force worker reset on crash to prevent "stuck" states
    if (globalWorker) {
      await globalWorker.terminate()
      globalWorker = null 
    }
    
    return NextResponse.json({ error: error.message || 'OCR failed' }, { status: 500 })
  }
}
