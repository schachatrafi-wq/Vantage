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

  const isTweet = article.source_domain === 'x.com' || article.source_domain === 'bsky.app'

  const topicDetails = article.topics
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter(Boolean)

  const timeAgo = article.published_at ? formatTimeAgo(new Date(article.published_at)) : null
  const hasImage = !!(article.image_url && !imgError)

  if (isTweet) {
    return <TweetCard article={article} rating={rating} isPending={isPending} onRate={(v) => { const next = rating === v ? null : v; setRating(next); startTransition(() => rateArticle(article.id, next)) }} />
  }

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
    <article className="card card-hover">
      <div className="flex gap-4 p-5">

        {/* Left: text content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">

          {/* Breaking badge */}
          {article.summary?.is_breaking && (
            <span
              className="inline-flex items-center gap-1 self-start rounded-md px-2.5 py-0.5 text-xs font-bold text-white tracking-widest uppercase"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 2px 8px rgba(255,55,95,0.30)',
              }}
            >
              ● Breaking
            </span>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--accent)' }}
            >
              {article.source_domain}
            </span>
            {timeAgo && (
              <>
                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.28)' }}>·</span>
                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.38)' }}>{timeAgo}</span>
              </>
            )}
            {topicDetails.slice(0, 1).map((topic) => (
              <span
                key={topic!.id}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  color: 'rgba(0,0,0,0.50)',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
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
            className="text-xl font-bold leading-snug line-clamp-3 transition-colors duration-150"
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              color: '#111111',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#111111')}
          >
            {article.title}
          </a>

          {/* Summary bullets */}
          {article.summary && article.summary.bullets.length > 0 && (
            <ul
              className="flex flex-col gap-1.5 pl-3.5"
              style={{ borderLeft: '2px solid rgba(255,55,95,0.45)' }}
            >
              {article.summary.bullets.slice(0, 3).map((bullet, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed line-clamp-2"
                  style={{ color: 'rgba(0,0,0,0.58)' }}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {/* Cross-topic flag */}
          {article.cross_topic_flag && (
            <div
              className="rounded-xl px-3 py-2 text-sm"
              style={{
                background: 'rgba(0,0,0,0.04)',
                color: 'rgba(0,0,0,0.56)',
                border: '1px solid rgba(0,0,0,0.07)',
              }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>↔ </span>
              {article.cross_topic_flag.reason}
            </div>
          )}

          {/* Actions row */}
          <div
            className="flex items-center justify-between pt-2 mt-0.5"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleRating(1)}
                disabled={isPending}
                className="rounded-lg px-2 py-1 text-sm transition-all duration-150"
                style={rating === 1 ? { background: 'rgba(22,163,74,0.10)', color: 'var(--success)' } : { color: 'rgba(0,0,0,0.34)' }}
                onMouseEnter={(e) => { if (rating !== 1) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
                onMouseLeave={(e) => { if (rating !== 1) e.currentTarget.style.background = '' }}
              >
                👍
              </button>
              <button
                onClick={() => handleRating(-1)}
                disabled={isPending}
                className="rounded-lg px-2 py-1 text-sm transition-all duration-150"
                style={rating === -1 ? { background: 'rgba(220,38,38,0.10)', color: 'var(--danger)' } : { color: 'rgba(0,0,0,0.34)' }}
                onMouseEnter={(e) => { if (rating !== -1) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
                onMouseLeave={(e) => { if (rating !== -1) e.currentTarget.style.background = '' }}
              >
                👎
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSourceRater((v) => !v)}
                className="text-xs transition-colors duration-150"
                style={{ color: 'rgba(0,0,0,0.34)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.60)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.34)')}
              >
                {sourceRating
                  ? `${'★'.repeat(sourceRating)}${'☆'.repeat(5 - sourceRating)}`
                  : 'Rate source'}
              </button>
              {showSourceRater && (
                <div className="glass-popup absolute right-0 bottom-8 flex gap-0.5 rounded-xl p-2 z-10">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleSourceRating(n)}
                      className="text-lg transition-colors px-0.5"
                      style={{ color: n <= (sourceRating ?? 0) ? 'var(--warning)' : 'rgba(0,0,0,0.24)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--warning)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = n <= (sourceRating ?? 0) ? 'var(--warning)' : 'rgba(0,0,0,0.24)')}
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
          <div
            className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden self-start"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <Image
              src={article.image_url!}
              alt=""
              width={144}
              height={144}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl self-start flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <span className="text-3xl opacity-30">
              {TOPICS.find((t) => t.id === article.topics[0])?.icon ?? '📰'}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}

function TweetCard({
  article,
  rating,
  isPending,
  onRate,
}: {
  article: ArticleWithSummary
  rating: 1 | -1 | null
  isPending: boolean
  onRate: (v: 1 | -1) => void
}) {
  const timeAgo = article.published_at ? formatTimeAgo(new Date(article.published_at)) : null
  const isBsky = article.source_domain === 'bsky.app'
  const usernameMatch = isBsky
    ? article.url.match(/bsky\.app\/profile\/([^/]+)\//)
    : article.url.match(/x\.com\/([^/]+)\/status\//)
  const displayHandle = usernameMatch ? `@${usernameMatch[1]}` : article.source_domain

  const tweetTopics = article.topics.map((id) => TOPICS.find((t) => t.id === id)).filter(Boolean)

  return (
    <article
      className="card card-hover"
      style={{ borderLeft: '3px solid rgba(0,0,0,0.10)' }}
    >
      <div className="flex gap-3 p-3.5">
        {/* Platform icon */}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-0.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.09)' }}
          >
            {isBsky ? (
              <span className="text-sm">🦋</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z" fill="#111111" fillOpacity="0.70"/>
              </svg>
            )}
          </div>
        </a>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
              {displayHandle}
            </span>
            {timeAgo && (
              <>
                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.28)' }}>·</span>
                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.38)' }}>{timeAgo}</span>
              </>
            )}
            {tweetTopics.slice(0, 1).map((topic) => (
              <span
                key={topic!.id}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  color: 'rgba(0,0,0,0.50)',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {topic!.icon} {topic!.name}
              </span>
            ))}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm leading-relaxed transition-colors duration-150"
            style={{ color: '#111111' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#111111')}
          >
            {article.title}
          </a>

          <div className="flex items-center gap-0.5 pt-1">
            <button
              onClick={() => onRate(1)}
              disabled={isPending}
              className="rounded-lg px-2 py-0.5 text-xs transition-all duration-150"
              style={rating === 1 ? { background: 'rgba(22,163,74,0.10)', color: 'var(--success)' } : { color: 'rgba(0,0,0,0.34)' }}
              onMouseEnter={(e) => { if (rating !== 1) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
              onMouseLeave={(e) => { if (rating !== 1) e.currentTarget.style.background = '' }}
            >
              👍
            </button>
            <button
              onClick={() => onRate(-1)}
              disabled={isPending}
              className="rounded-lg px-2 py-0.5 text-xs transition-all duration-150"
              style={rating === -1 ? { background: 'rgba(220,38,38,0.10)', color: 'var(--danger)' } : { color: 'rgba(0,0,0,0.34)' }}
              onMouseEnter={(e) => { if (rating !== -1) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
              onMouseLeave={(e) => { if (rating !== -1) e.currentTarget.style.background = '' }}
            >
              👎
            </button>
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
