import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { runIngestion } from '@/lib/ingestion/run'

export const maxDuration = 300

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServerClient()
    const result = await runIngestion(supabase)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/ingest] error:', message, err instanceof Error ? err.stack : '')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
