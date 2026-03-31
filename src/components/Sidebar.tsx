'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import type { Topic } from '@/lib/topics'

type Props = {
  userTopics: Topic[]
}

const NAV = [
  { href: '/dashboard',             label: 'My Feed',  icon: '⚡' },
  { href: '/dashboard/breaking',    label: 'Breaking', icon: '🔴' },
  { href: '/dashboard/connections', label: 'Connections', icon: '🔀' },
  { href: '/dashboard/ask',         label: 'Ask AI',   icon: '💬' },
  { href: '/dashboard/settings',    label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ userTopics }: Props) {
  const pathname = usePathname()

  return (
    <aside className="sidebar-glass flex h-full w-56 flex-col shrink-0 px-3 py-5">
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <span className="text-lg font-bold text-white tracking-tight">Vantage</span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
          style={{
            color: 'var(--accent)',
            background: 'rgba(255,55,95,0.14)',
            border: '1px solid rgba(255,55,95,0.22)',
          }}
        >
          BETA
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150',
                active
                  ? 'text-accent'
                  : 'text-[rgba(235,235,245,0.55)] hover:text-[rgba(235,235,245,0.92)]',
              ].join(' ')}
              style={active ? {
                background: 'rgba(255,55,95,0.13)',
                border: '1px solid rgba(255,55,95,0.22)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 16px rgba(255,55,95,0.12)',
              } : {
                border: '1px solid transparent',
              }}
            >
              <span className="text-sm w-4 text-center leading-none">{icon}</span>
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
            style={{ color: 'rgba(235,235,245,0.28)' }}
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
                  className={[
                    'flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm transition-all duration-150',
                    active
                      ? 'text-accent'
                      : 'text-[rgba(235,235,245,0.55)] hover:text-[rgba(235,235,245,0.92)]',
                  ].join(' ')}
                  style={active ? {
                    background: 'rgba(255,55,95,0.13)',
                    border: '1px solid rgba(255,55,95,0.22)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  } : {
                    border: '1px solid transparent',
                  }}
                >
                  <span className="text-sm w-4 text-center leading-none">{topic.icon}</span>
                  <span className="truncate">{topic.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Account */}
      <div
        className="mt-auto flex items-center gap-2.5 px-2 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <UserButton
          appearance={{
            variables: {
              colorBackground: 'rgba(10,13,34,0.90)',
              colorText: '#ffffff',
            },
          }}
        />
        <span style={{ color: 'rgba(235,235,245,0.36)', fontSize: '12px' }}>Account</span>
      </div>
    </aside>
  )
}
