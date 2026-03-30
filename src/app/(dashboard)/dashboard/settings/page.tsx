'use client'

import { useState, useEffect, useTransition } from 'react'
import { TOPICS, MAX_USER_TOPICS } from '@/lib/topics'
import { createBrowserClient } from '@/lib/supabase/client'
import { saveSettings } from '../../actions'
import { useUser } from '@clerk/nextjs'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function SettingsPage() {
  const { user } = useUser()
  const { state: pushState, subscribe, unsubscribe } = usePushNotifications()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [ingestState, setIngestState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [ingestResult, setIngestResult] = useState<{ ingested: number; breaking: number; analyzed?: number; message?: string } | null>(null)

  async function handleIngest() {
    setIngestState('running')
    setIngestResult(null)
    try {
      const res = await fetch('/api/ingest', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setIngestResult(data)
      setIngestState('done')
    } catch {
      setIngestState('error')
    }
  }

  useEffect(() => {
    if (!user) return
    const supabase = createBrowserClient()
    void Promise.resolve(
      supabase
        .from('user_topics')
        .select('topic_id, priority_order')
        .eq('user_id', user.id)
        .order('priority_order')
    ).then(({ data }) => {
      setSelected(((data ?? []) as { topic_id: string }[]).map((r) => r.topic_id))
      setLoading(false)
    }).catch(() => setLoading(false))
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
        <div className="h-6 w-32 bg-[#2c2c2e] rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[rgba(235,235,245,0.5)] text-sm mt-1.5">Manage your topic preferences</p>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-white mb-1">My Topics</h2>
        <p className="text-sm text-[rgba(235,235,245,0.5)] mb-4">
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
                    ? 'border-accent bg-accent/10 text-white'
                    : isDisabled
                      ? 'border-[rgba(84,84,88,0.45)] bg-[#1c1c1e] opacity-40 cursor-not-allowed'
                      : 'border-[rgba(84,84,88,0.45)] bg-[#1c1c1e] text-white hover:border-accent/60 hover:bg-[#2c2c2e] cursor-pointer',
                ].join(' ')}
              >
                <span className="text-2xl">{topic.icon}</span>
                <span className="text-sm font-semibold leading-snug">{topic.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-white mb-1">Notifications</h2>
        <p className="text-sm text-[rgba(235,235,245,0.5)] mb-4">
          Receive a morning (9am) and evening (6pm) digest, plus instant breaking news alerts.
        </p>
        <div className="flex items-center gap-3">
          {pushState === 'unsupported' && (
            <span className="text-sm text-muted">Push notifications not supported in this browser.</span>
          )}
          {pushState === 'denied' && (
            <span className="text-sm text-danger">Notifications blocked. Enable them in browser settings.</span>
          )}
          {pushState === 'subscribed' && (
            <>
              <span className="text-sm text-success">✓ Notifications enabled</span>
              <button
                onClick={unsubscribe}
                className="text-xs text-muted hover:text-danger transition-colors"
              >
                Disable
              </button>
            </>
          )}
          {(pushState === 'unsubscribed' || pushState === 'loading') && (
            <button
              onClick={subscribe}
              disabled={pushState === 'loading'}
              className="rounded-lg bg-[#2c2c2e] border border-[rgba(84,84,88,0.65)] px-4 py-2 text-sm font-medium text-white hover:border-accent/60 transition-colors disabled:opacity-40"
            >
              Enable push notifications
            </button>
          )}
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
        <span className="text-xs text-[rgba(235,235,245,0.4)] ml-auto">
          {selected.length} / {MAX_USER_TOPICS} selected
        </span>
      </div>

      <section className="mt-10 pt-8 border-t border-[rgba(84,84,88,0.45)]">
        <h2 className="text-base font-semibold text-white mb-1">News Ingestion</h2>
        <p className="text-sm text-[rgba(235,235,245,0.5)] mb-4">
          Manually fetch and analyze the latest articles from all sources. This normally runs automatically every 4 hours.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleIngest}
            disabled={ingestState === 'running'}
            className="rounded-lg bg-[#2c2c2e] border border-[rgba(84,84,88,0.65)] px-5 py-2 text-sm font-medium text-white hover:border-accent/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ingestState === 'running' ? '⏳ Fetching & analyzing…' : 'Run ingestion now'}
          </button>
          {ingestState === 'done' && ingestResult && (
            <span className="text-sm text-success">
              {ingestResult.message
                ? `ℹ️ ${ingestResult.message}`
                : `✓ ${ingestResult.ingested} articles ingested (${ingestResult.analyzed} analyzed${ingestResult.breaking > 0 ? `, ${ingestResult.breaking} breaking` : ''})`}
            </span>
          )}
          {ingestState === 'error' && (
            <span className="text-sm text-danger">Failed — check your Anthropic API credits at console.anthropic.com</span>
          )}
        </div>
        {ingestState === 'running' && (
          <p className="text-xs text-[rgba(235,235,245,0.4)] mt-2">This can take 1–3 minutes depending on how many articles need analyzing.</p>
        )}
      </section>
    </div>
  )
}
