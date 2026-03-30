'use client'

import { useState, useEffect, useTransition } from 'react'
import { TOPICS, MAX_USER_TOPICS } from '@/lib/topics'
import { createBrowserClient } from '@/lib/supabase/client'
import { saveSettings } from '../../actions'
import { useUser } from '@clerk/nextjs'

export default function SettingsPage() {
  const { user } = useUser()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createBrowserClient()
    supabase
      .from('user_topics')
      .select('topic_id, priority_order')
      .eq('user_id', user.id)
      .order('priority_order')
      .then(({ data }) => {
        setSelected((data ?? []).map((r) => r.topic_id))
        setLoading(false)
      })
  }, [user])

  function toggle(topicId: string) {
    setSelected((prev) => {
      if (prev.includes(topicId)) return prev.filter((t) => t !== topicId)
      if (prev.length >= MAX_USER_TOPICS) return prev
      return [...prev, topicId]
    })
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await saveSettings(selected)
      setSaved(true)
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="h-6 w-32 bg-surface-2 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your topic preferences</p>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-1">My Topics</h2>
        <p className="text-sm text-muted mb-4">
          Choose up to {MAX_USER_TOPICS} topics. Your feed and digests are ranked around them.
        </p>

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
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={selected.length === 0 || isPending}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-sm text-success">✓ Saved</span>}
        <span className="text-xs text-muted ml-auto">
          {selected.length} / {MAX_USER_TOPICS} selected
        </span>
      </div>
    </div>
  )
}
