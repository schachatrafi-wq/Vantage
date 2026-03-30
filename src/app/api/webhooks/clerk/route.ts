import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createServerClient } from '@/lib/supabase/server'

type ClerkUserEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted'
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    first_name: string | null
    last_name: string | null
    primary_email_address_id: string | null
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Missing webhook secret', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(webhookSecret)

  let event: ClerkUserEvent
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = createServerClient()

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, primary_email_address_id } = event.data
    const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id)
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    await supabase.from('users').insert({
      id,
      email: primaryEmail?.email_address ?? '',
      name,
      onboarding_completed: false,
    })
  }

  if (event.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, primary_email_address_id } = event.data
    const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id)
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    await supabase.from('users').upsert({
      id,
      email: primaryEmail?.email_address ?? '',
      name,
    })
  }

  if (event.type === 'user.deleted') {
    await supabase.from('users').delete().eq('id', event.data.id)
  }

  return new Response('OK', { status: 200 })
}
