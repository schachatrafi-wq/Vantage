'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function SortToggle({ current }: { current: 'recent' | 'relevance' }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setSort(sort: 'recent' | 'relevance') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const base = 'px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150'
  const active = 'text-white'
  const inactive = 'transition-colors'

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl p-0.5"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <button
        onClick={() => setSort('recent')}
        className={`${base} ${current === 'recent' ? active : inactive}`}
        style={current === 'recent' ? {
          background: 'rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
          color: 'var(--foreground)',
        } : { color: 'var(--muted)' }}
      >
        Recent
      </button>
      <button
        onClick={() => setSort('relevance')}
        className={`${base} ${current === 'relevance' ? active : inactive}`}
        style={current === 'relevance' ? {
          background: 'rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
          color: 'var(--foreground)',
        } : { color: 'var(--muted)' }}
      >
        Relevance
      </button>
    </div>
  )
}
