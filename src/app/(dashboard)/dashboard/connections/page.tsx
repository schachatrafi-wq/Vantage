import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import ArticleCard from '@/components/ArticleCard'
import type { ArticleWithSummary } from '@/lib/types'

const THREE_DAYS_AGO = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

export default async function ConnectionsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: crossFlags } = await supabase
    .from('cross_topic_flags')
    .select('article_id, topic_ids, reason')
    .gte('created_at', THREE_DAYS_AGO())
    .order('created_at', { ascending: false })
    .limit(60)

  const articleIds = [...new Set((crossFlags ?? []).map((f) => f.article_id))]

  if (articleIds.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Connections</h1>
          <p className="text-muted text-sm mt-1.5">Articles that span multiple topics</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-4xl mb-4">🔀</span>
          <p className="text-muted text-sm">No cross-topic articles yet. Run ingestion to populate.</p>
        </div>
      </div>
    )
  }

  const [{ data: articles }, { data: summaries }, { data: articleTopicRows }, { data: sourceRatingRows }] =
    await Promise.all([
      supabase.from('articles').select('*').in('id', articleIds).gte('published_at', THREE_DAYS_AGO()).order('published_at', { ascending: false }),
      supabase.from('article_summaries').select('*').in('article_id', articleIds),
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

  // Group by the topic pairs they connect
  const topicPairGroups: Record<string, ArticleWithSummary[]> = {}
  for (const article of feed) {
    const flag = crossFlagMap[article.id]
    if (!flag) continue
    const key = [...flag.topic_ids].sort().join('+')
    if (!topicPairGroups[key]) topicPairGroups[key] = []
    topicPairGroups[key].push(article)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Connections</h1>
        <p className="text-muted text-sm mt-1.5">
          {feed.length} {feed.length === 1 ? 'article' : 'articles'} spanning multiple topics
        </p>
      </div>

      {Object.entries(topicPairGroups).map(([key, groupArticles]) => {
        const topicIds = key.split('+')
        const topicNames = topicIds
          .map((id) => TOPICS.find((t) => t.id === id))
          .filter(Boolean)
          .map((t) => `${t!.icon} ${t!.name}`)
        return (
          <section key={key} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-foreground">{topicNames.join('  ↔  ')}</h2>
              <span className="text-xs text-muted-2 bg-surface-2 border border-border px-2 py-0.5 rounded-full">
                {groupArticles.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {groupArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
