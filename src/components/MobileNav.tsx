'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

// ── Icons (18×18, same visual language as Sidebar) ───────────────────────────

function IconFeed() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="currentColor">
      <rect x="0" y="0.5" width="15" height="2.2" rx="1.1"/>
      <rect x="0" y="5.5" width="10" height="2.2" rx="1.1"/>
      <rect x="0" y="10.5" width="12.5" height="2.2" rx="1.1"/>
    </svg>
  )
}

function IconBreaking() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="currentColor">
      <rect x="6.4" y="0.5" width="2.2" height="8.5" rx="1.1"/>
      <rect x="6.4" y="11.5" width="2.2" height="2.5" rx="1.1"/>
    </svg>
  )
}

function IconConnections() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7.5" cy="2.5" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="2"   cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="13"  cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
      <line x1="7.5" y1="4.3"  x2="2.8"  y2="10.7"/>
      <line x1="7.5" y1="4.3"  x2="12.2" y2="10.7"/>
      <line x1="3.8" y1="12.5" x2="11.2" y2="12.5"/>
    </svg>
  )
}

function IconAnthropic() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,13.5 7.5,1.5 13.5,13.5"/>
      <line x1="4.2" y1="9.5" x2="10.8" y2="9.5"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.2"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.87 2.87l1.06 1.06M11.07 11.07l1.06 1.06M2.87 12.13l1.06-1.06M11.07 3.93l1.06-1.06"/>
    </svg>
  )
}

const NAV: { href: string; label: string; Icon: () => React.ReactElement }[] = [
  { href: '/dashboard',             label: 'Feed',      Icon: IconFeed },
  { href: '/dashboard/breaking',    label: 'Breaking',  Icon: IconBreaking },
  { href: '/dashboard/connections', label: 'Connect',   Icon: IconConnections },
  { href: '/dashboard/ask',         label: 'Ask AI',    Icon: IconAnthropic },
  { href: '/dashboard/settings',    label: 'Settings',  Icon: IconSettings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2">
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
        <UserButton
          appearance={{
            variables: { colorBackground: '#ffffff', colorText: '#111111' },
          }}
        />
      </header>

      {/* ── Bottom tab bar ─────────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around"
        style={{
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          height: '60px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-150"
              style={{ color: active ? 'var(--accent)' : 'rgba(0,0,0,0.38)' }}
            >
              <Icon />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
