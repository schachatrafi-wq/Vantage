'use client'

import { useEffect, useState } from 'react'

export type PushState = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading')

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setState(sub ? 'subscribed' : 'unsubscribed')
      })
      .catch(() => setState('unsupported'))
  }, [])

  async function subscribe(): Promise<string | null> {
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
        return 'Configuration error: VAPID key missing'
      }

      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()

      if (permission === 'denied') {
        setState('denied')
        return 'Notifications blocked in browser settings'
      }

      if (permission !== 'granted') {
        return 'Permission not granted'
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
            auth: arrayBufferToBase64(sub.getKey('auth')!),
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      if (!res.ok) {
        console.error('[push] Failed to save subscription', res.status)
        return 'Failed to save subscription'
      }

      setState('subscribed')
      return null
    } catch (err) {
      console.error('[push] subscribe error:', err)
      return err instanceof Error ? err.message : String(err)
    }
  }

  async function unsubscribe(): Promise<void> {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return

    await fetch('/api/push', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
    setState('unsubscribed')
  }

  return { state, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
