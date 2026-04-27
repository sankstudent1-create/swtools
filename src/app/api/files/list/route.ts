import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const toolId = searchParams.get('tool_id')

  let query = supabase
    .from('files')
    .select('id, filename, created_at, size_bytes, tool_id')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (toolId) {
    query = query.eq('tool_id', toolId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ files: data })
}
