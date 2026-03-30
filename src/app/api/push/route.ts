import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

type PushSubscriptionBody = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  timezone: string
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = (await req.json()) as PushSubscriptionBody

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return new Response('Invalid subscription', { status: 400 })
  }

  const supabase = createServerClient()

  await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh,
    auth: body.keys.auth,
    timezone: body.timezone ?? 'UTC',
  })

  return new Response('OK', { status: 200 })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { endpoint } = (await req.json()) as { endpoint: string }

  const supabase = createServerClient()
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', userId)

  return new Response('OK', { status: 200 })
}
