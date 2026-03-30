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
  const hasImage = !!(article.image_url && !imgError)

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
      <div className="flex gap-3 p-4">
        {/* Left: all text content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Breaking badge */}
          {article.summary?.is_breaking && (
            <span className="inline-flex items-center gap-1 self-start rounded-md bg-breaking px-2 py-0.5 text-[11px] font-bold text-white tracking-wide">
              ● BREAKING
            </span>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wide">
              {article.source_domain}
            </span>
            {timeAgo && (
              <>
                <span className="text-[rgba(235,235,245,0.3)] text-[11px]">·</span>
                <span className="text-[11px] text-[rgba(235,235,245,0.45)]">{timeAgo}</span>
              </>
            )}
            {topicDetails.slice(0, 1).map((topic) => (
              <span
                key={topic!.id}
                className="inline-flex items-center gap-0.5 rounded-full bg-[#2c2c2e] px-1.5 py-0.5 text-[10px] text-[rgba(235,235,245,0.5)]"
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
            className="text-[15px] font-bold text-white leading-snug hover:text-accent transition-colors line-clamp-3"
          >
            {article.title}
          </a>

          {/* Bullets */}
          {article.summary && article.summary.bullets.length > 0 && (
            <ul className="flex flex-col gap-1 border-l-2 border-accent/30 pl-3">
              {article.summary.bullets.slice(0, 2).map((bullet, i) => (
                <li key={i} className="text-[13px] text-[rgba(235,235,245,0.55)] leading-relaxed line-clamp-2">
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {/* Cross-topic */}
          {article.cross_topic_flag && (
            <div className="rounded-lg bg-[#2c2c2e] px-2.5 py-1.5 text-xs text-[rgba(235,235,245,0.55)]">
              <span className="text-accent font-semibold">↔ </span>
              {article.cross_topic_flag.reason}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[rgba(84,84,88,0.3)] mt-0.5">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleRating(1)}
                disabled={isPending}
                className={[
                  'rounded-lg px-2 py-1 text-xs transition-all',
                  rating === 1
                    ? 'bg-success/15 text-success'
                    : 'text-[rgba(235,235,245,0.4)] hover:bg-[#2c2c2e] hover:text-white',
                ].join(' ')}
              >
                👍
              </button>
              <button
                onClick={() => handleRating(-1)}
                disabled={isPending}
                className={[
                  'rounded-lg px-2 py-1 text-xs transition-all',
                  rating === -1
                    ? 'bg-danger/15 text-danger'
                    : 'text-[rgba(235,235,245,0.4)] hover:bg-[#2c2c2e] hover:text-white',
                ].join(' ')}
              >
                👎
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSourceRater((v) => !v)}
                className="text-[11px] text-[rgba(235,235,245,0.3)] hover:text-[rgba(235,235,245,0.7)] transition-colors"
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
                        n <= (sourceRating ?? 0) ? 'text-warning' : 'text-[rgba(235,235,245,0.3)] hover:text-warning',
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

        {/* Right: thumbnail */}
        {hasImage ? (
          <div className="flex-shrink-0 w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-xl overflow-hidden bg-[#2c2c2e] self-start mt-0.5">
            <Image
              src={article.image_url!}
              alt=""
              width={110}
              height={110}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          </div>
        ) : (
          /* Placeholder keeps layout stable when no image */
          <div className="flex-shrink-0 w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-xl bg-[#2c2c2e] self-start mt-0.5 flex items-center justify-center">
            <span className="text-2xl opacity-30">
              {TOPICS.find((t) => t.id === article.topics[0])?.icon ?? '📰'}
            </span>
          </div>
        )}
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
