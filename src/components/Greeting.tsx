'use client'

import { useMemo } from 'react'

type Props = {
  firstName: string
  topicNames: string[]
}

export default function Greeting({ firstName, topicNames }: Props) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good Morning'
    if (hour >= 12 && hour < 17) return 'Good Afternoon'
    if (hour >= 17 && hour < 21) return 'Good Evening'
    return 'Good Night'
  }, [])

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight leading-tight" style={{ color: 'var(--foreground)' }}>
        {greeting},{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #FF375F 0%, #FF7B9C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {firstName}
        </span>
        .
      </h1>
      <p className="text-base font-medium mt-1.5" style={{ color: 'var(--muted)' }}>
        Let&apos;s monitor the situation.
      </p>
      {topicNames.length > 0 && (
        <p className="text-sm mt-1" style={{ color: 'var(--muted-2)' }}>
          Tracking {topicNames.join(', ')}
        </p>
      )}
    </div>
  )
}
