import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import ArticleCard from '@/components/ArticleCard'
import SortToggle from '@/components/SortToggle'
import type { ArticleWithSummary } from '@/lib/types'

const THREE_DAYS_AGO = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [{ slug }, { sort: sortParam }] = await Promise.all([params, searchParams])
  const sort: 'recent' | 'relevance' = sortParam === 'relevance' ? 'relevance' : 'recent'

  const supabase = createServerClient()

  // Support both predefined and custom topics
  let topicName: string
  let topicIcon: string
  let topicDescription: string

  const predefined = TOPICS.find((t) => t.slug === slug)
  if (predefined) {
    topicName = predefined.name
    topicIcon = predefined.icon
    topicDescription = predefined.description
  } else {
    const { data: custom } = await supabase
      .from('user_custom_topics')
      .select('name, icon')
      .eq('slug', slug)
      .limit(1)
      .single()
    if (!custom) notFound()
    topicName = custom.name
    topicIcon = custom.icon
    topicDescription = `Your custom topic: ${custom.name}`
  }

  const topic = { id: slug, name: topicName, slug, description: topicDescription, icon: topicIcon }

  const [{ data: recentArticleRows }, { data: sourceRatingRows }] = await Promise.all([
    supabase
      .from('articles')
      .select('id')
      .gte('published_at', THREE_DAYS_AGO())
      .order('published_at', { ascending: false })
      .limit(300),
    supabase.from('user_source_ratings').select('source_domain, rating').eq('user_id', userId),
  ])

  const recentArticleIds = (recentArticleRows ?? []).map((r) => r.id)

  const { data: articleTopicRows } = recentArticleIds.length > 0
    ? await supabase
        .from('article_topics')
        .select('article_id, relevance_score')
        .eq('topic_id', topic.id)
        .in('article_id', recentArticleIds)
        .gte('relevance_score', 0.3)
    : { data: [] }

  const articleIds = (articleTopicRows ?? []).map((r) => r.article_id)

  if (articleIds.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <p className="text-3xl mb-2">{topic.icon}</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{topic.name}</h1>
          <p className="text-muted text-sm mt-1.5">{topic.description}</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted text-sm">No articles yet for this topic. Run ingestion to populate.</p>
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

  const feed: ArticleWithSummary[] = (articles ?? []).map((article) => ({
    ...article,
    summary: summaryMap[article.id] ?? null,
    topics: [topic.id],
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

  const breaking = feed.filter((a) => a.summary?.is_breaking)
  const rest = feed.filter((a) => !a.summary?.is_breaking)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <p className="text-3xl mb-2">{topic.icon}</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{topic.name}</h1>
            <p className="text-muted text-sm mt-1.5">{topic.description}</p>
          </div>
          <Suspense fallback={null}>
            <SortToggle current={sort} />
          </Suspense>
        </div>
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
