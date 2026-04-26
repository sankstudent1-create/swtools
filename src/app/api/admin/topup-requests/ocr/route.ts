import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import Tesseract from 'tesseract.js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { imageUrl } = await req.json()
  if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })

  try {
    console.log('[ocr] Starting OCR for image:', imageUrl)
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      { logger: m => {
        if (m.status === 'recognizing text' && Math.floor(m.progress * 100) % 20 === 0) {
          console.log(`[ocr] Progress: ${Math.floor(m.progress * 100)}%`)
        }
      }}
    )
    
    const text = result.data.text
    console.log('[ocr] Extracted text length:', text?.length)
    
    // Regex to find 12-digit UTR (common in Indian UPI)
    // Matches patterns like "UTR: 123456789012" or just "123456789012"
    const utrMatch = text.match(/\b\d{12}\b/)
    const utr = utrMatch ? utrMatch[0] : null
    
    if (!utr) {
      console.warn('[ocr] No 12-digit UTR found in text. Full text preview:', text.substring(0, 200))
    } else {
      console.log('[ocr] Successfully extracted UTR:', utr)
    }

    return NextResponse.json({ text, utr })
  } catch (error: any) {
    console.error('[ocr] OCR processing error:', {
      message: error.message,
      stack: error.stack,
      imageUrl
    })
    return NextResponse.json({ 
      error: 'OCR processing failed', 
      details: error.message,
      imageUrl
    }, { status: 500 })
  }
}
