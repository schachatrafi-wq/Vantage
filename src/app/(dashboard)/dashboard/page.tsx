import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import ArticleCard from '@/components/ArticleCard'
import Greeting from '@/components/Greeting'
import type { ArticleWithSummary } from '@/lib/types'

export const dynamic = 'force-dynamic'

const EIGHT_HOURS_AGO = () => new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const [{ data: userTopicRows }, { data: customTopicRows }, { data: sourceRatingRows }, user] =
    await Promise.all([
      supabase.from('user_topics').select('topic_id').eq('user_id', userId),
      supabase.from('user_custom_topics').select('slug').eq('user_id', userId),
      supabase.from('user_source_ratings').select('source_domain, rating').eq('user_id', userId),
      currentUser(),
    ])

  const predefinedTopicIds = (userTopicRows ?? []).map((r) => r.topic_id)
  if (predefinedTopicIds.length === 0) redirect('/onboarding')
  const customTopicIds = (customTopicRows ?? []).map((r) => r.slug)
  const topicIds = [...predefinedTopicIds, ...customTopicIds]

  const sourceRatings = Object.fromEntries(
    (sourceRatingRows ?? []).map((r) => [r.source_domain, r.rating])
  )

  const { data: recentArticleRows } = await supabase
    .from('articles')
    .select('id')
    .gte('published_at', EIGHT_HOURS_AGO())
    .order('published_at', { ascending: false })
    .limit(400)

  const recentArticleIds = (recentArticleRows ?? []).map((r) => r.id)

  const { data: articleTopicRows } = recentArticleIds.length > 0
    ? await supabase
        .from('article_topics')
        .select('article_id, topic_id, relevance_score')
        .in('topic_id', topicIds)
        .in('article_id', recentArticleIds)
        .gte('relevance_score', 0.3)
    : { data: [] }

  const articleIds = [...new Set((articleTopicRows ?? []).map((r) => r.article_id))]

  const firstName = user?.firstName ?? 'there'
  const topicNames = topicIds.map((id) => TOPICS.find((t) => t.id === id)?.name).filter(Boolean) as string[]

  if (articleIds.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Greeting firstName={firstName} topicNames={topicNames} />
        <EmptyFeed />
      </div>
    )
  }

  const [{ data: articles }, { data: summaries }, { data: crossFlags }, { data: userRatings }] =
    await Promise.all([
      supabase.from('articles').select('*').in('id', articleIds).order('published_at', { ascending: false }).limit(60),
      supabase.from('article_summaries').select('*').in('article_id', articleIds),
      supabase.from('cross_topic_flags').select('*').in('article_id', articleIds),
      supabase.from('user_article_ratings').select('article_id, rating').eq('user_id', userId).in('article_id', articleIds),
    ])

  const summaryMap = Object.fromEntries((summaries ?? []).map((s) => [s.article_id, s]))
  const crossFlagMap = Object.fromEntries((crossFlags ?? []).map((f) => [f.article_id, f]))
  const userRatingMap = Object.fromEntries((userRatings ?? []).map((r) => [r.article_id, r.rating as 1 | -1]))
  const articleTopicsMap: Record<string, string[]> = {}
  for (const row of articleTopicRows ?? []) {
    if (!articleTopicsMap[row.article_id]) articleTopicsMap[row.article_id] = []
    articleTopicsMap[row.article_id].push(row.topic_id)
  }

  const feed: ArticleWithSummary[] = (articles ?? [])
    .map((article) => ({
      ...article,
      summary: summaryMap[article.id] ?? null,
      topics: articleTopicsMap[article.id] ?? [],
      cross_topic_flag: crossFlagMap[article.id] ?? null,
      user_rating: userRatingMap[article.id] ?? null,
      source_rating: sourceRatings[article.source_domain] ?? null,
      relevance_score: 0,
    }))
    .sort((a, b) => {
      const ta = a.published_at ? new Date(a.published_at).getTime() : 0
      const tb = b.published_at ? new Date(b.published_at).getTime() : 0
      return tb - ta
    })

  const breakingArticles = feed.filter((a) => a.summary?.is_breaking)
  const feedArticles = feed.filter((a) => !a.summary?.is_breaking).slice(0, 40)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Greeting firstName={firstName} topicNames={topicNames} />

      <p className="text-[10px] font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--muted-2)' }}>
        Latest News
      </p>

      {breakingArticles.length > 0 && (
        <section className="mb-8">
          <span className="text-sm font-bold text-breaking uppercase tracking-wide block mb-4">🔴 Breaking</span>
          <div className="flex flex-col gap-3">
            {breakingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {feedArticles.length > 0 && (
        <div className="flex flex-col gap-3">
          {feedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {feedArticles.length === 0 && breakingArticles.length === 0 && <EmptyFeed />}
    </div>
  )
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center h-80 text-center">
      <span className="text-5xl mb-4">📡</span>
      <h2 className="text-lg font-semibold text-foreground">No recent stories</h2>
      <p className="text-sm text-muted mt-2 max-w-sm">
        Nothing in the last 8 hours for your topics. Run ingestion or check back soon.
      </p>
    </div>
  )
}
