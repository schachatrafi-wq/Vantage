'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TOPICS, MAX_USER_TOPICS } from '@/lib/topics'
import { saveUserTopics } from './actions'

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle(topicId: string) {
    setSelected((prev) => {
      if (prev.includes(topicId)) return prev.filter((t) => t !== topicId)
      if (prev.length >= MAX_USER_TOPICS) return prev
      return [...prev, topicId]
    })
  }

  function handleSubmit() {
    startTransition(async () => {
      await saveUserTopics(selected)
      router.push('/dashboard')
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Vantage</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            What do you want to follow?
          </h1>
          <p className="text-muted mt-3 text-sm max-w-sm mx-auto">
            Pick up to {MAX_USER_TOPICS} topics. We&apos;ll build your personalized feed around them.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOPICS.map((topic) => {
            const isSelected = selected.includes(topic.id)
            const isDisabled = !isSelected && selected.length >= MAX_USER_TOPICS
            return (
              <button
                key={topic.id}
                onClick={() => toggle(topic.id)}
                disabled={isDisabled}
                className={[
                  'flex flex-col gap-2 rounded-lg border p-3.5 text-left transition-all',
                  isSelected
                    ? 'border-accent/60 bg-accent/10 text-foreground'
                    : isDisabled
                      ? 'border-border bg-surface opacity-30 cursor-not-allowed'
                      : 'border-border bg-surface text-foreground hover:border-border hover:bg-surface-2 cursor-pointer',
                ].join(' ')}
              >
                <span className="text-xl">{topic.icon}</span>
                <span className="text-sm font-semibold leading-snug text-foreground">{topic.name}</span>
                <span className="text-xs text-muted leading-snug">{topic.description}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: MAX_USER_TOPICS }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i < selected.length ? 'bg-accent' : 'bg-surface-2 border border-border',
                  ].join(' ')}
                />
              ))}
            </div>
            <span className="text-xs text-muted">{selected.length}/{MAX_USER_TOPICS}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0 || isPending}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isPending ? 'Building feed…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
