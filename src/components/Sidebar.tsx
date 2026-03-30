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
  { href: '/dashboard/ask', label: 'Ask AI', icon: '💬' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ userTopics }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col shrink-0 border-r border-[rgba(84,84,88,0.45)] bg-[#111111] px-3 py-5">
      <div className="mb-6 px-2 flex items-center gap-2">
        <span className="text-lg font-bold text-white tracking-tight">Vantage</span>
        <span className="text-[9px] font-bold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded tracking-widest">
          BETA
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all',
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-[rgba(235,235,245,0.6)] hover:bg-[#2c2c2e] hover:text-white',
              ].join(' ')}
            >
              <span className="text-sm w-4 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {userTopics.length > 0 && (
        <div className="mt-6 flex-1 overflow-y-auto min-h-0">
          <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-[rgba(235,235,245,0.3)]">
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
                    'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-all',
                    active
                      ? 'bg-accent/10 text-accent'
                      : 'text-[rgba(235,235,245,0.6)] hover:bg-[#2c2c2e] hover:text-white',
                  ].join(' ')}
                >
                  <span className="text-sm w-4 text-center">{topic.icon}</span>
                  <span className="truncate">{topic.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2.5 px-2 pt-3 border-t border-[rgba(84,84,88,0.45)]">
        <UserButton
          appearance={{
            variables: { colorBackground: '#1c1c1e', colorText: '#ffffff' },
          }}
        />
        <span className="text-xs text-[rgba(235,235,245,0.4)]">Account</span>
      </div>
    </aside>
  )
}
