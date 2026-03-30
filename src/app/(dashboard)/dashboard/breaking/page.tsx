import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import ArticleCard from '@/components/ArticleCard'
import type { ArticleWithSummary } from '@/lib/types'

const THREE_DAYS_AGO = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

export default async function BreakingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: breakingSummaries } = await supabase
    .from('article_summaries')
    .select('article_id')
    .eq('is_breaking', true)
    .gte('created_at', THREE_DAYS_AGO())
    .order('created_at', { ascending: false })
    .limit(40)

  const articleIds = (breakingSummaries ?? []).map((s) => s.article_id)

  if (articleIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Breaking News</h1>
          <p className="text-[rgba(235,235,245,0.5)] text-sm mt-1.5">Significant breaking stories across all topics</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-4xl mb-4">🔴</span>
          <p className="text-[rgba(235,235,245,0.5)] text-sm">No breaking news right now.</p>
        </div>
      </div>
    )
  }

  const [{ data: articles }, { data: summaries }, { data: crossFlags }, { data: articleTopicRows }, { data: sourceRatingRows }] =
    await Promise.all([
      supabase.from('articles').select('*').in('id', articleIds).gte('published_at', THREE_DAYS_AGO()).order('published_at', { ascending: false }),
      supabase.from('article_summaries').select('*').in('article_id', articleIds),
      supabase.from('cross_topic_flags').select('*').in('article_id', articleIds),
      supabase.from('article_topics').select('article_id, topic_id').in('article_id', articleIds),
      supabase.from('user_source_ratings').select('source_domain, rating').eq('user_id', userId),
    ])

  const summaryMap = Object.fromEntries((summaries ?? []).map((s) => [s.article_id, s]))
  const crossFlagMap = Object.fromEntries((crossFlags ?? []).map((f) => [f.article_id, f]))
  const sourceRatings = Object.fromEntries((sourceRatingRows ?? []).map((r) => [r.source_domain, r.rating]))
  const articleTopicsMap: Record<string, string[]> = {}
  for (const row of articleTopicRows ?? []) {
    if (!articleTopicsMap[row.article_id]) articleTopicsMap[row.article_id] = []
    articleTopicsMap[row.article_id].push(row.topic_id)
  }

  const feed: ArticleWithSummary[] = (articles ?? []).map((article) => ({
    ...article,
    summary: summaryMap[article.id] ?? null,
    topics: articleTopicsMap[article.id] ?? [],
    cross_topic_flag: crossFlagMap[article.id] ?? null,
    user_rating: null,
    source_rating: sourceRatings[article.source_domain] ?? null,
    relevance_score: 1,
  }))

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Breaking News</h1>
        <p className="text-[rgba(235,235,245,0.5)] text-sm mt-1.5">
          {feed.length} significant {feed.length === 1 ? 'story' : 'stories'} across {TOPICS.length} topics
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {feed.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
