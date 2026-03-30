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
      <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
        {greeting},{' '}
        <span className="text-accent">{firstName}</span>.
      </h1>
      <p className="text-base text-[rgba(235,235,245,0.6)] mt-1.5 font-medium">
        Let&apos;s monitor the situation.
      </p>
      {topicNames.length > 0 && (
        <p className="text-sm text-[rgba(235,235,245,0.35)] mt-1">
          Tracking {topicNames.join(', ')}
        </p>
      )}
    </div>
  )
}
