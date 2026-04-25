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
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      { logger: m => console.log(m) }
    )
    
    const text = result.data.text
    // Regex to find 12-digit UTR (common in Indian UPI)
    // Matches patterns like "UTR: 123456789012" or just "123456789012"
    const utrMatch = text.match(/\b\d{12}\b/)
    const utr = utrMatch ? utrMatch[0] : null

    return NextResponse.json({ text, utr })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
