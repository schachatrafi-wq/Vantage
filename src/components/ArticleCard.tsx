'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
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
  const [imgError, setImgError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const topicDetails = article.topics
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter(Boolean)

  const timeAgo = article.published_at ? formatTimeAgo(new Date(article.published_at)) : null
  const hasImage = article.image_url && !imgError

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
    <article className="card card-hover transition-colors duration-150">
      {/* Full-width image */}
      {hasImage && (
        <div className="relative w-full h-48 bg-[#2c2c2e]">
          <Image
            src={article.image_url!}
            alt=""
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
          {article.summary?.is_breaking && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-breaking px-2.5 py-0.5 text-xs font-bold text-white tracking-wide shadow-lg">
                ● BREAKING
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Breaking badge (no image) */}
        {!hasImage && article.summary?.is_breaking && (
          <span className="inline-flex items-center gap-1 self-start rounded-md bg-breaking px-2.5 py-0.5 text-xs font-bold text-white tracking-wide">
            ● BREAKING
          </span>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
            {article.source_domain}
          </span>
          {timeAgo && (
            <>
              <span className="text-muted text-xs">·</span>
              <span className="text-xs text-muted">{timeAgo}</span>
            </>
          )}
          {topicDetails.slice(0, 2).map((topic) => (
            <span
              key={topic!.id}
              className="inline-flex items-center gap-1 rounded-full bg-[#2c2c2e] px-2 py-0.5 text-[11px] text-muted"
            >
              {topic!.icon} {topic!.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[17px] font-bold text-foreground leading-snug hover:text-accent transition-colors"
        >
          {article.title}
        </a>

        {/* Bullets */}
        {article.summary && article.summary.bullets.length > 0 && (
          <ul className="flex flex-col gap-1.5 border-l-2 border-accent/40 pl-3 mt-0.5">
            {article.summary.bullets.map((bullet, i) => (
              <li key={i} className="text-sm text-muted leading-relaxed">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {/* Cross-topic */}
        {article.cross_topic_flag && (
          <div className="rounded-lg bg-[#2c2c2e] px-3 py-2 text-xs text-muted">
            <span className="text-accent font-semibold">↔ Cross-topic: </span>
            {article.cross_topic_flag.reason}
          </div>
        )}

        {/* Divider + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(84,84,88,0.4)] mt-1">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleRating(1)}
              disabled={isPending}
              className={[
                'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                rating === 1
                  ? 'bg-success/15 text-success'
                  : 'text-muted hover:bg-[#2c2c2e] hover:text-foreground',
              ].join(' ')}
            >
              👍
            </button>
            <button
              onClick={() => handleRating(-1)}
              disabled={isPending}
              className={[
                'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                rating === -1
                  ? 'bg-danger/15 text-danger'
                  : 'text-muted hover:bg-[#2c2c2e] hover:text-foreground',
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
              {sourceRating
                ? `${'★'.repeat(sourceRating)}${'☆'.repeat(5 - sourceRating)}`
                : 'Rate source'}
            </button>
            {showSourceRater && (
              <div className="absolute right-0 bottom-8 flex gap-0.5 rounded-xl border border-[rgba(84,84,88,0.65)] bg-[#1c1c1e] p-2 shadow-2xl z-10">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSourceRating(n)}
                    className={[
                      'text-base transition-colors px-0.5',
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
