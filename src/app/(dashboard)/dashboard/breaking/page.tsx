import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import ArticleCard from '@/components/ArticleCard'
import SortToggle from '@/components/SortToggle'
import type { ArticleWithSummary } from '@/lib/types'

const THREE_DAYS_AGO = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

export default async function BreakingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { sort: sortParam } = await searchParams
  const sort: 'recent' | 'relevance' = sortParam === 'relevance' ? 'relevance' : 'recent'

  const supabase = createServerClient()

  const { data: breakingSummaries } = await supabase
    .from('article_summaries')
    .select('article_id')
    .eq('is_breaking', true)
    .gte('created_at', THREE_DAYS_AGO())
    .order('created_at', { ascending: false })
    .limit(60)

  const articleIds = (breakingSummaries ?? []).map((s) => s.article_id)

  if (articleIds.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Breaking News</h1>
          <p className="text-muted text-sm mt-1.5">Significant breaking stories across all topics</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-4xl mb-4">🔴</span>
          <p className="text-muted text-sm">No breaking news right now.</p>
        </div>
      </div>
    )
  }

  const [{ data: articles }, { data: summaries }, { data: crossFlags }, { data: articleTopicRows }, { data: sourceRatingRows }] =
    await Promise.all([
      supabase.from('articles').select('*').in('id', articleIds).gte('published_at', THREE_DAYS_AGO()),
      supabase.from('article_summaries').select('*').in('article_id', articleIds),
      supabase.from('cross_topic_flags').select('*').in('article_id', articleIds),
      supabase.from('article_topics').select('article_id, topic_id, relevance_score').in('article_id', articleIds),
      supabase.from('user_source_ratings').select('source_domain, rating').eq('user_id', userId),
    ])

  const summaryMap = Object.fromEntries((summaries ?? []).map((s) => [s.article_id, s]))
  const crossFlagMap = Object.fromEntries((crossFlags ?? []).map((f) => [f.article_id, f]))
  const sourceRatings = Object.fromEntries((sourceRatingRows ?? []).map((r) => [r.source_domain, r.rating]))
  const articleTopicsMap: Record<string, string[]> = {}
  const relevanceMap: Record<string, number> = {}
  for (const row of articleTopicRows ?? []) {
    if (!articleTopicsMap[row.article_id]) articleTopicsMap[row.article_id] = []
    articleTopicsMap[row.article_id].push(row.topic_id)
    relevanceMap[row.article_id] = Math.max(relevanceMap[row.article_id] ?? 0, row.relevance_score)
  }

  const feed: ArticleWithSummary[] = (articles ?? []).map((article) => ({
    ...article,
    summary: summaryMap[article.id] ?? null,
    topics: articleTopicsMap[article.id] ?? [],
    cross_topic_flag: crossFlagMap[article.id] ?? null,
    user_rating: null,
    source_rating: sourceRatings[article.source_domain] ?? null,
    relevance_score: relevanceMap[article.id] ?? 0,
  }))

  if (sort === 'relevance') {
    feed.sort((a, b) => b.relevance_score - a.relevance_score)
  } else {
    feed.sort((a, b) => {
      const ta = a.published_at ? new Date(a.published_at).getTime() : 0
      const tb = b.published_at ? new Date(b.published_at).getTime() : 0
      return tb - ta
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Breaking News</h1>
          <p className="text-muted text-sm mt-1.5">
            {feed.length} significant {feed.length === 1 ? 'story' : 'stories'} across {TOPICS.length} topics
          </p>
        </div>
        <Suspense fallback={null}>
          <SortToggle current={sort} />
        </Suspense>
      </div>
      <div className="flex flex-col gap-3">
        {feed.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
