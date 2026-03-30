import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import ArticleCard from '@/components/ArticleCard'
import type { ArticleWithSummary } from '@/lib/types'

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { slug } = await params
  const topic = TOPICS.find((t) => t.slug === slug)
  if (!topic) notFound()

  const supabase = createServerClient()

  const [{ data: articleTopicRows }, { data: sourceRatingRows }] = await Promise.all([
    supabase
      .from('article_topics')
      .select('article_id, relevance_score')
      .eq('topic_id', topic.id)
      .gte('relevance_score', 0.3)
      .order('relevance_score', { ascending: false })
      .limit(100),
    supabase.from('user_source_ratings').select('source_domain, rating').eq('user_id', userId),
  ])

  const articleIds = (articleTopicRows ?? []).map((r) => r.article_id)

  if (articleIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <p className="text-3xl mb-2">{topic.icon}</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">{topic.name}</h1>
          <p className="text-[rgba(235,235,245,0.5)] text-sm mt-1.5">{topic.description}</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-[rgba(235,235,245,0.5)] text-sm">No articles yet for this topic. Run ingestion to populate.</p>
        </div>
      </div>
    )
  }

  const [{ data: articles }, { data: summaries }, { data: crossFlags }] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .in('id', articleIds)
      .order('published_at', { ascending: false })
      .limit(40),
    supabase.from('article_summaries').select('*').in('article_id', articleIds),
    supabase.from('cross_topic_flags').select('*').in('article_id', articleIds),
  ])

  const summaryMap = Object.fromEntries((summaries ?? []).map((s) => [s.article_id, s]))
  const crossFlagMap = Object.fromEntries((crossFlags ?? []).map((f) => [f.article_id, f]))
  const sourceRatings = Object.fromEntries((sourceRatingRows ?? []).map((r) => [r.source_domain, r.rating]))
  const relevanceMap = Object.fromEntries((articleTopicRows ?? []).map((r) => [r.article_id, r.relevance_score]))

  const feed: ArticleWithSummary[] = (articles ?? [])
    .map((article) => ({
      ...article,
      summary: summaryMap[article.id] ?? null,
      topics: [topic.id],
      cross_topic_flag: crossFlagMap[article.id] ?? null,
      user_rating: null,
      source_rating: sourceRatings[article.source_domain] ?? null,
      relevance_score: relevanceMap[article.id] ?? 0,
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)

  const breaking = feed.filter((a) => a.summary?.is_breaking)
  const rest = feed.filter((a) => !a.summary?.is_breaking)

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <p className="text-3xl mb-2">{topic.icon}</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">{topic.name}</h1>
        <p className="text-[rgba(235,235,245,0.5)] text-sm mt-1.5">{topic.description}</p>
      </div>

      {breaking.length > 0 && (
        <section className="mb-8">
          <p className="text-xs font-bold text-breaking uppercase tracking-wide mb-3">● Breaking</p>
          <div className="flex flex-col gap-3">
            {breaking.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {rest.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
