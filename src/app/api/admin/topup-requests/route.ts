import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('manual_topup_requests')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ requests: data })
}

type ApproveBody = {
  request_id: string
  action: 'approve' | 'reject'
  admin_notes?: string
}

export async function POST(req: NextRequest) {
  const { isAdmin, user: adminUser } = await requireAdmin()
  if (!isAdmin || !adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as ApproveBody
  const { request_id, action, admin_notes } = body

  if (!request_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  // 1. Fetch request details
  const { data: request, error: fetchErr } = await admin
    .from('manual_topup_requests')
    .select('*')
    .eq('id', request_id)
    .single()

  if (fetchErr || !request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
  }

  if (action === 'reject') {
    const { error: rejectErr } = await admin
      .from('manual_topup_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser.id,
        admin_notes: admin_notes || 'Rejected by admin'
      })
      .eq('id', request_id)

    if (rejectErr) return NextResponse.json({ error: rejectErr.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // 2. Approve: Add credits and update status in one transaction-ish flow
  // Note: wallet_add_credits is already an RPC
  const { error: creditErr } = await admin.rpc('wallet_add_credits', {
    p_user_id: request.user_id,
    p_delta_credits: request.credits_requested,
    p_reason: 'manual_topup_approval',
    p_ref_type: 'manual_topup_request',
    p_ref_id: request_id
  })

  if (creditErr) {
    return NextResponse.json({ error: `Credit addition failed: ${creditErr.message}` }, { status: 500 })
  }

  const { error: updateErr } = await admin
    .from('manual_topup_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUser.id,
      admin_notes: admin_notes || 'Approved'
    })
    .eq('id', request_id)

  if (updateErr) {
    // This is rare but bad: credits added but status not updated.
    // In a real prod env, use a DB transaction/function for both.
    console.error('CRITICAL: Credits added but status update failed for request', request_id)
    return NextResponse.json({ error: 'Status update failed after credits added' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
