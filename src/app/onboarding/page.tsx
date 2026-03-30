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
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Welcome to Vantage
          </h1>
          <p className="text-muted mt-3 text-base">
            Choose up to {MAX_USER_TOPICS} topics you want to follow. We&apos;ll build your
            personalized intelligence feed around them.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((topic) => {
            const isSelected = selected.includes(topic.id)
            const isDisabled = !isSelected && selected.length >= MAX_USER_TOPICS
            return (
              <button
                key={topic.id}
                onClick={() => toggle(topic.id)}
                disabled={isDisabled}
                className={[
                  'flex flex-col gap-2 rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-accent bg-accent-muted text-foreground'
                    : isDisabled
                      ? 'border-border bg-surface opacity-40 cursor-not-allowed'
                      : 'border-border bg-surface text-foreground hover:border-accent hover:bg-surface-2 cursor-pointer',
                ].join(' ')}
              >
                <span className="text-2xl">{topic.icon}</span>
                <span className="text-sm font-semibold leading-snug">{topic.name}</span>
                <span className="text-xs text-muted leading-snug">{topic.description}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm text-muted">
            {selected.length} / {MAX_USER_TOPICS} selected
          </span>
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0 || isPending}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Build my feed →'}
          </button>
        </div>
      </div>
    </div>
  )
}
