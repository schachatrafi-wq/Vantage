import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { runIngestion } from '@/lib/ingestion/run'

export const maxDuration = 300

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const result = await runIngestion(supabase)
  return NextResponse.json(result)
}
