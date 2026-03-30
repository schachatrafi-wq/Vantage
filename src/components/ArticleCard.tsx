'use client'

import { useState, useTransition } from 'react'
import type { ArticleWithSummary } from '@/lib/types'
import { rateArticle, rateSource } from '@/app/(dashboard)/actions'
import { TOPICS } from '@/lib/topics'

type Props = {
  article: ArticleWithSummary
}

export default function ArticleCard({ article }: Props) {
  const [rating, setRating] = useState<1 | -1 | null>(article.user_rating)
  const [sourceRating, setSourceRating] = useState<number | null>(article.source_rating)
  const [showSourceRater, setShowSourceRater] = useState(false)
  const [isPending, startTransition] = useTransition()

  const topicDetails = article.topics
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter(Boolean)

  const timeAgo = article.published_at
    ? formatTimeAgo(new Date(article.published_at))
    : null

  function handleRating(value: 1 | -1) {
    const next = rating === value ? null : value
    setRating(next)
    startTransition(() => rateArticle(article.id, next))
  }

  function handleSourceRating(value: number) {
    setSourceRating(value)
    setShowSourceRater(false)
    startTransition(() => rateSource(article.source_domain, value))
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4 hover:border-accent/40 transition-colors">
      {article.summary?.is_breaking && (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
            🔴 BREAKING
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-foreground leading-snug hover:text-accent transition-colors"
        >
          {article.title}
        </a>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted">{article.source_domain}</span>
          {timeAgo && <span className="text-xs text-muted">· {timeAgo}</span>}
          {topicDetails.map((topic) => (
            <span
              key={topic!.id}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted"
            >
              {topic!.icon} {topic!.name}
            </span>
          ))}
        </div>
      </div>

      {article.summary && article.summary.bullets.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-l-2 border-accent-muted pl-3">
          {article.summary.bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-muted leading-relaxed">
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {article.cross_topic_flag && (
        <div className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-muted">
          <span className="text-accent font-medium">🔀 Cross-topic: </span>
          {article.cross_topic_flag.reason}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRating(1)}
            disabled={isPending}
            className={[
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              rating === 1
                ? 'bg-success/20 text-success'
                : 'text-muted hover:bg-surface-2 hover:text-foreground',
            ].join(' ')}
          >
            👍
          </button>
          <button
            onClick={() => handleRating(-1)}
            disabled={isPending}
            className={[
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              rating === -1
                ? 'bg-danger/20 text-danger'
                : 'text-muted hover:bg-surface-2 hover:text-foreground',
            ].join(' ')}
          >
            👎
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSourceRater((v) => !v)}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            {sourceRating ? `Source: ${'★'.repeat(sourceRating)}` : 'Rate source'}
          </button>

          {showSourceRater && (
            <div className="absolute right-0 bottom-8 flex gap-1 rounded-lg border border-border bg-surface-2 p-2 shadow-lg z-10">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => handleSourceRating(n)}
                  className={[
                    'text-sm transition-colors px-0.5',
                    n <= (sourceRating ?? 0) ? 'text-warning' : 'text-muted hover:text-warning',
                  ].join(' ')}
                >
                  ★
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
