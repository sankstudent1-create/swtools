import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('admin_settings')
    .select('value,updated_at')
    .eq('key', 'credits_per_inr')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const creditsPerInr = Number(data?.value?.credits_per_inr ?? data?.value ?? 1)
  return NextResponse.json({ credits_per_inr: creditsPerInr, updated_at: data?.updated_at ?? null })
}
