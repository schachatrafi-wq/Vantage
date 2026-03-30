'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import type { Topic } from '@/lib/topics'

type Props = {
  userTopics: Topic[]
}

const NAV = [
  { href: '/dashboard', label: 'My Feed', icon: '⚡' },
  { href: '/dashboard/breaking', label: 'Breaking', icon: '🔴' },
  { href: '/dashboard/connections', label: 'Connections', icon: '🔀' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ userTopics }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-surface px-3 py-5 shrink-0">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-foreground tracking-tight">Vantage</span>
        <span className="ml-2 text-xs text-muted font-medium">BETA</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-accent-muted text-accent'
                : 'text-muted hover:bg-surface-2 hover:text-foreground',
            ].join(' ')}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {userTopics.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
            My Topics
          </p>
          <div className="flex flex-col gap-0.5">
            {userTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/dashboard/topic/${topic.slug}`}
                className={[
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                  pathname === `/dashboard/topic/${topic.slug}`
                    ? 'bg-accent-muted text-accent'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
                ].join(' ')}
              >
                <span className="text-base">{topic.icon}</span>
                <span className="truncate">{topic.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 px-2 pt-4 border-t border-border">
        <UserButton
          appearance={{
            variables: { colorBackground: '#131c2e', colorText: '#f0f4ff' },
          }}
        />
        <span className="text-xs text-muted">Account</span>
      </div>
    </aside>
  )
}
