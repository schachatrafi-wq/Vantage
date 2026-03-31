'use client'

import { useState, useRef, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function NotificationBell() {
  const { state, subscribe, unsubscribe } = usePushNotifications()
  const [open, setOpen] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (state === 'unsupported') return null

  const isOn = state === 'subscribed'

  async function handleEnable() {
    setWorking(true)
    setError(null)
    const err = await subscribe()
    setWorking(false)
    if (err) {
      setError(err)
    } else {
      setOpen(false)
    }
  }

  async function handleDisable() {
    setWorking(true)
    await unsubscribe()
    setWorking(false)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium w-full transition-all duration-150"
        style={{
          border: '1px solid transparent',
          color: isOn ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.45)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.88)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = isOn ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.45)' }}
      >
        <span className="text-sm w-4 text-center leading-none select-none">
          {isOn ? '🔔' : '🔕'}
        </span>
        <span className="truncate">{isOn ? 'Alerts on' : 'Alerts off'}</span>
        {isOn && (
          <span
            className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: 'var(--success)' }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl p-4 z-50"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.10)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          }}
        >
          {state === 'denied' && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#111111' }}>
                Notifications blocked
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.52)' }}>
                Open browser settings and allow notifications for this site.
              </p>
            </div>
          )}

          {state === 'unsubscribed' && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#111111' }}>
                Stay in the loop
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(0,0,0,0.52)' }}>
                Breaking news instantly + morning & evening digest.
              </p>
              {error && (
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--danger)' }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleEnable}
                disabled={working}
                className="btn-accent w-full rounded-xl py-2 text-xs font-semibold"
              >
                {working ? 'Enabling…' : 'Enable notifications'}
              </button>
            </div>
          )}

          {state === 'subscribed' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--success)' }} />
                <p className="text-xs font-semibold" style={{ color: '#111111' }}>
                  Notifications active
                </p>
              </div>
              <ul className="text-xs space-y-1 mb-3" style={{ color: 'rgba(0,0,0,0.52)' }}>
                <li>🔴 Breaking news — instant</li>
                <li>☀️ Morning digest — 9 am</li>
                <li>🌙 Evening digest — 6 pm</li>
              </ul>
              <button
                onClick={handleDisable}
                disabled={working}
                className="text-xs w-full text-center py-1.5 rounded-xl transition-colors"
                style={{ color: 'rgba(0,0,0,0.42)', border: '1px solid rgba(0,0,0,0.10)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.42)')}
              >
                {working ? 'Disabling…' : 'Disable notifications'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
