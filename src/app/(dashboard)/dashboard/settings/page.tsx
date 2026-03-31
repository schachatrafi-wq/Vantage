'use client'

import { useState, useEffect, useTransition } from 'react'
import { TOPICS, MAX_USER_TOPICS, MAX_CUSTOM_TOPICS } from '@/lib/topics'
import { createBrowserClient } from '@/lib/supabase/client'
import { saveSettings, addCustomTopic, removeCustomTopic } from '../../actions'
import { useUser } from '@clerk/nextjs'
import { usePushNotifications } from '@/hooks/usePushNotifications'

type CustomTopic = { name: string; slug: string; icon: string }

export default function SettingsPage() {
  const { user } = useUser()
  const { state: pushState, subscribe, unsubscribe } = usePushNotifications()
  const [selected, setSelected] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<CustomTopic[]>([])
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')
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
      const text = await res.text()
      let data: Record<string, unknown>
      try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`) }
      if (!res.ok) throw new Error((data.error as string) ?? 'Failed')
      setIngestResult(data as { ingested: number; breaking: number; analyzed?: number; message?: string })
      setIngestState('done')
    } catch (err) {
      setIngestState('error')
      setIngestResult({ ingested: 0, breaking: 0, message: err instanceof Error ? err.message : String(err) })
    }
  }

  useEffect(() => {
    if (!user) return
    const supabase = createBrowserClient()
    Promise.all([
      supabase.from('user_topics').select('topic_id, priority_order').eq('user_id', user.id).order('priority_order'),
      supabase.from('user_custom_topics').select('name, slug, icon').eq('user_id', user.id).order('created_at'),
    ]).then(([{ data: topicData }, { data: customData }]) => {
      setSelected(((topicData ?? []) as { topic_id: string }[]).map((r) => r.topic_id))
      setCustomTopics((customData ?? []) as CustomTopic[])
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

  function handleAddCustomTopic(e: React.FormEvent) {
    e.preventDefault()
    setCustomError('')
    startTransition(async () => {
      try {
        await addCustomTopic(customInput)
        const supabase = createBrowserClient()
        const { data } = await supabase.from('user_custom_topics').select('name, slug, icon').eq('user_id', user!.id).order('created_at')
        setCustomTopics((data ?? []) as CustomTopic[])
        setCustomInput('')
      } catch (err) {
        setCustomError(err instanceof Error ? err.message : 'Failed to add topic')
      }
    })
  }

  function handleRemoveCustomTopic(slug: string) {
    startTransition(async () => {
      await removeCustomTopic(slug)
      setCustomTopics((prev) => prev.filter((t) => t.slug !== slug))
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-6 w-32 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Settings</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>Manage your topic preferences</p>
      </div>

      {/* Custom Topics */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Custom Topics</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Type any topic you want — we&apos;ll find news for it automatically. Up to {MAX_CUSTOM_TOPICS} custom topics.
        </p>

        <form onSubmit={handleAddCustomTopic} className="flex gap-2 mb-4">
          <input
            type="text"
            value={customInput}
            onChange={(e) => { setCustomInput(e.target.value); setCustomError('') }}
            placeholder='"Formula 1", "Israeli elections", "Poker"'
            maxLength={80}
            className="input-glass flex-1 rounded-xl px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={!customInput.trim() || isPending || customTopics.length >= MAX_CUSTOM_TOPICS}
            className="btn-accent rounded-xl px-4 py-2.5 text-sm whitespace-nowrap"
          >
            Add topic
          </button>
        </form>

        {customError && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{customError}</p>}

        {customTopics.length > 0 && (
          <div className="flex flex-col gap-2">
            {customTopics.map((ct) => (
              <div
                key={ct.slug}
                className="glass flex items-center justify-between rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{ct.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{ct.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--muted-2)' }}
                  >
                    custom
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveCustomTopic(ct.slug)}
                  disabled={isPending}
                  className="text-xs transition-colors"
                  style={{ color: 'var(--muted-2)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-2)')}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {customTopics.length === 0 && (
          <p className="text-sm italic" style={{ color: 'var(--muted-2)' }}>No custom topics yet. Add your first one above.</p>
        )}
      </section>

      {/* Predefined Topics */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>My Topics</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Choose up to {MAX_USER_TOPICS} topics. Your feed is ranked around them.
        </p>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TOPICS.map((topic) => {
            const isSelected = selected.includes(topic.id)
            const isDisabled = !isSelected && selected.length >= MAX_USER_TOPICS
            return (
              <button
                key={topic.id}
                onClick={() => toggle(topic.id)}
                disabled={isDisabled}
                className="flex flex-col gap-2 rounded-xl p-3.5 text-left transition-all duration-150"
                style={isSelected ? {
                  background: 'rgba(255,55,95,0.13)',
                  border: '1px solid rgba(255,55,95,0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 0 20px rgba(255,55,95,0.10)',
                  color: 'var(--foreground)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                } : isDisabled ? {
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'var(--muted-2)',
                  opacity: 0.38,
                  cursor: 'not-allowed',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'var(--foreground)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <span className="text-xl">{topic.icon}</span>
                <span className="text-sm font-semibold leading-snug">{topic.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Save row */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={selected.length === 0 || isPending}
          className="btn-accent rounded-xl px-5 py-2.5 text-sm"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-sm" style={{ color: 'var(--success)' }}>✓ Saved</span>}
        <span className="text-xs ml-auto" style={{ color: 'var(--muted-2)' }}>
          {selected.length} / {MAX_USER_TOPICS} selected
        </span>
      </div>

      {/* Notifications */}
      <section className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Notifications</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Receive a morning (9am) and evening (6pm) digest, plus instant breaking news alerts.
        </p>
        <div className="flex items-center gap-3">
          {pushState === 'unsupported' && (
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Push notifications not supported in this browser.</span>
          )}
          {pushState === 'denied' && (
            <span className="text-sm" style={{ color: 'var(--danger)' }}>Notifications blocked. Enable them in browser settings.</span>
          )}
          {pushState === 'subscribed' && (
            <>
              <span className="text-sm" style={{ color: 'var(--success)' }}>✓ Notifications enabled</span>
              <button
                onClick={unsubscribe}
                className="text-xs transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                Disable
              </button>
            </>
          )}
          {(pushState === 'unsubscribed' || pushState === 'loading') && (
            <button
              onClick={subscribe}
              disabled={pushState === 'loading'}
              className="btn-glass rounded-xl px-4 py-2 text-sm font-medium"
            >
              Enable push notifications
            </button>
          )}
        </div>
      </section>

      {/* News Ingestion */}
      <section className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>News Ingestion</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Manually fetch and analyze the latest articles. Normally runs automatically every 4 hours.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleIngest}
            disabled={ingestState === 'running'}
            className="btn-glass rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            {ingestState === 'running' ? '⏳ Fetching & analyzing…' : 'Run ingestion now'}
          </button>
          {ingestState === 'done' && ingestResult && (
            <span className="text-sm" style={{ color: 'var(--success)' }}>
              {ingestResult.message
                ? `ℹ️ ${ingestResult.message}`
                : `✓ ${ingestResult.ingested} ingested (${ingestResult.analyzed} analyzed${ingestResult.breaking > 0 ? `, ${ingestResult.breaking} breaking` : ''})`}
            </span>
          )}
          {ingestState === 'error' && (
            <span className="text-sm" style={{ color: 'var(--danger)' }}>
              Failed{ingestResult?.message ? `: ${ingestResult.message}` : ' — check server logs'}
            </span>
          )}
        </div>
        {ingestState === 'running' && (
          <p className="text-xs mt-2" style={{ color: 'var(--muted-2)' }}>
            This takes ~30–45 seconds.
          </p>
        )}
      </section>
    </div>
  )
}
