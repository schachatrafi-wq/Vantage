'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import type { Topic } from '@/lib/topics'
import NotificationBell from './NotificationBell'

type Props = {
  userTopics: Topic[]
}

// ── Nav icons ─────────────────────────────────────────────────────────────────

function IconFeed() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="0" y="0.5" width="15" height="2.2" rx="1.1"/>
      <rect x="0" y="5.5" width="10" height="2.2" rx="1.1"/>
      <rect x="0" y="10.5" width="12.5" height="2.2" rx="1.1"/>
    </svg>
  )
}

function IconBreaking() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="6.4" y="0.5" width="2.2" height="8.5" rx="1.1"/>
      <rect x="6.4" y="11.5" width="2.2" height="2.5" rx="1.1"/>
    </svg>
  )
}

function IconConnections() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7.5" cy="2.5" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="2"   cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="13"  cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
      <line x1="7.5" y1="4.3"  x2="2.8"  y2="10.7"/>
      <line x1="7.5" y1="4.3"  x2="12.2" y2="10.7"/>
      <line x1="3.8" y1="12.5" x2="11.2" y2="12.5"/>
    </svg>
  )
}

// Anthropic "A" monogram — two diagonal strokes + crossbar
function IconAnthropic() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,13.5 7.5,1.5 13.5,13.5"/>
      <line x1="4.2" y1="9.5" x2="10.8" y2="9.5"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.2"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.87 2.87l1.06 1.06M11.07 11.07l1.06 1.06M2.87 12.13l1.06-1.06M11.07 3.93l1.06-1.06"/>
    </svg>
  )
}

const NAV: { href: string; label: string; Icon: () => JSX.Element }[] = [
  { href: '/dashboard',             label: 'My Feed',     Icon: IconFeed },
  { href: '/dashboard/breaking',    label: 'Breaking',    Icon: IconBreaking },
  { href: '/dashboard/connections', label: 'Connections', Icon: IconConnections },
  { href: '/dashboard/ask',         label: 'Ask AI',      Icon: IconAnthropic },
  { href: '/dashboard/settings',    label: 'Settings',    Icon: IconSettings },
]

export default function Sidebar({ userTopics }: Props) {
  const pathname = usePathname()

  return (
    <aside className="sidebar-glass flex h-full w-56 flex-col shrink-0 px-3 py-5">
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: '#111111', fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Vantage
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
          style={{
            color: 'var(--accent)',
            background: 'rgba(255,55,95,0.08)',
            border: '1px solid rgba(255,55,95,0.18)',
          }}
        >
          BETA
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150"
              style={active ? {
                background: 'rgba(255,55,95,0.08)',
                border: '1px solid rgba(255,55,95,0.18)',
                color: 'var(--accent)',
              } : {
                border: '1px solid transparent',
                color: 'rgba(0,0,0,0.48)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.88)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.48)' }}
            >
              <span className="w-4 flex items-center justify-center shrink-0">
                <Icon />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Topic list */}
      {userTopics.length > 0 && (
        <div className="mt-6 flex-1 overflow-y-auto min-h-0">
          <p
            className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(0,0,0,0.36)' }}
          >
            My Topics
          </p>
          <div className="flex flex-col gap-0.5">
            {userTopics.map((topic) => {
              const active = pathname === `/dashboard/topic/${topic.slug}`
              return (
                <Link
                  key={topic.id}
                  href={`/dashboard/topic/${topic.slug}`}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm transition-all duration-150"
                  style={active ? {
                    background: 'rgba(255,55,95,0.08)',
                    border: '1px solid rgba(255,55,95,0.18)',
                    color: 'var(--accent)',
                  } : {
                    border: '1px solid transparent',
                    color: 'rgba(0,0,0,0.52)',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.88)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.52)' }}
                >
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: active ? 'var(--accent)' : 'rgba(0,0,0,0.28)' }}
                  />
                  <span className="truncate">{topic.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom: notifications + account */}
      <div
        className="mt-auto pt-3 flex flex-col gap-1"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
      >
        <NotificationBell />
        <div className="flex items-center gap-2.5 px-2 py-2">
          <UserButton
            appearance={{
              variables: {
                colorBackground: '#ffffff',
                colorText: '#111111',
              },
            }}
          />
          <span style={{ color: 'rgba(0,0,0,0.40)', fontSize: '12px' }}>Account</span>
        </div>
      </div>
    </aside>
  )
}
