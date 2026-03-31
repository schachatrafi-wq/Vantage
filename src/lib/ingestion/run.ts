/**
 * Core ingestion pipeline — shared by the API route (manual trigger)
 * and the Trigger.dev scheduled task.
 *
 * Optimisations vs the original per-article loop:
 *  1. og:image fetch and Claude analysis run in PARALLEL (saves ~15-25 s)
 *  2. Claude concurrency raised to 20 (saves ~10 s)
 *  3. Supabase writes are 4 bulk inserts instead of ~400 sequential queries
 *  4. og:image fetcher uses a worker-pool so slow URLs don't block the group
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchRssFeed } from '@/lib/sources/rss'
import { fetchNewsApiForTopic } from '@/lib/sources/newsapi'
import { filterNewArticles } from '@/lib/ingestion/dedupe'
import { analyzeArticlesBatch } from '@/lib/ingestion/analyze'
import type { TopicMeta } from '@/lib/ingestion/analyze'
import { batchFetchOgImages } from '@/lib/sources/ogimage'
import { RSS_FEEDS } from '@/lib/sources/feeds'
import { TOPICS } from '@/lib/topics'

export type IngestionResult = {
  ingested: number
  breaking: number
  analyzed: number
  breakingArticleIds: string[]
  message?: string
}

type IngestItem = {
  title: string
  url: string
  sourceDomain: string
  publishedAt: Date | null
  content: string
  imageUrl: string | null
  candidateTopicIds: string[]
}

const log = {
  info: (msg: string, ctx?: object) => console.log(`[ingest] ${msg}`, ctx ?? ''),
  warn: (msg: string, ctx?: object) => console.warn(`[ingest] ${msg}`, ctx ?? ''),
  error: (msg: string, ctx?: object) => console.error(`[ingest] ${msg}`, ctx ?? ''),
}

export async function runIngestion(supabase: SupabaseClient): Promise<IngestionResult> {
  const allItems: IngestItem[] = []
  const topicOverrides: Record<string, TopicMeta> = {}

  // ── 1. RSS feeds ────────────────────────────────────────────────────────────
  log.info('Fetching RSS feeds', { count: RSS_FEEDS.length })
  const rssResults = await Promise.allSettled(
    RSS_FEEDS.map((feed) =>
      fetchRssFeed(feed.url, feed.label).then((items) =>
        items.map((item) => ({ ...item, candidateTopicIds: feed.topicIds }))
      )
    )
  )
  for (const r of rssResults) {
    if (r.status === 'fulfilled') allItems.push(...r.value)
  }
  log.info('RSS done', { total: allItems.length })

  // ── 2. NewsAPI ───────────────────────────────────────────────────────────────
  const newsApiKey = process.env.NEWS_API_KEY
  if (newsApiKey) {
    log.info('Fetching NewsAPI')
    const newsResults = await Promise.allSettled(
      TOPICS.map((topic) =>
        fetchNewsApiForTopic(topic.id, newsApiKey).then((items) =>
          items.map((item) => ({ ...item, candidateTopicIds: [topic.id] }))
        )
      )
    )
    for (const r of newsResults) {
      if (r.status === 'fulfilled') allItems.push(...r.value)
    }
    log.info('NewsAPI done', { total: allItems.length })
  }

  // ── 3. Custom topics — one Google News RSS per unique slug ───────────────────
  const { data: customTopicRows } = await supabase
    .from('user_custom_topics')
    .select('slug, name')

  const uniqueCustomTopics = new Map<string, string>()
  for (const ct of customTopicRows ?? []) {
    if (!uniqueCustomTopics.has(ct.slug)) uniqueCustomTopics.set(ct.slug, ct.name)
  }

  if (uniqueCustomTopics.size > 0) {
    log.info('Fetching custom topic feeds', { count: uniqueCustomTopics.size })
    const customResults = await Promise.allSettled(
      [...uniqueCustomTopics.entries()].map(([slug, name]) => {
        topicOverrides[slug] = { name, description: `Custom topic: ${name}` }
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(name)}&hl=en-US&gl=US&ceid=US:en`
        return fetchRssFeed(url, `Custom: ${name}`, 30).then((items) =>
          items.map((item) => ({ ...item, candidateTopicIds: [slug] }))
        )
      })
    )
    for (const r of customResults) {
      if (r.status === 'fulfilled') allItems.push(...r.value)
    }
    log.info('Custom topics done', { total: allItems.length })
  }

  // ── 4. Age filter (3 days) ───────────────────────────────────────────────────
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000
  const recentItems = allItems.filter(
    (item) => !item.publishedAt || item.publishedAt.getTime() >= cutoff
  )
  log.info('After age filter', { kept: recentItems.length, dropped: allItems.length - recentItems.length })

  // ── 5. Deduplicate against DB ────────────────────────────────────────────────
  const newItems = await filterNewArticles(supabase, recentItems)
  log.info('New after dedup', { count: newItems.length })

  if (newItems.length === 0) {
    return { ingested: 0, breaking: 0, analyzed: 0, breakingArticleIds: [], message: 'No new articles — all already in DB' }
  }

  // ── 6. Round-robin interleave for fair topic coverage ────────────────────────
  const toAnalyze = interleaveByTopic(newItems, 60)
  log.info('Selected for analysis', { count: toAnalyze.length })

  // ── 7+8. og:image fetch and Claude analysis IN PARALLEL ──────────────────────
  const needsImage = toAnalyze.map((item) => !item.imageUrl)
  const urlsToFetch = toAnalyze.map((item, i) => (needsImage[i] ? item.url : ''))

  log.info('Running og:image fetch + Claude analysis in parallel', {
    images: needsImage.filter(Boolean).length,
    articles: toAnalyze.length,
  })

  const [ogImages, analyses] = await Promise.all([
    batchFetchOgImages(urlsToFetch, 40),
    analyzeArticlesBatch(
      toAnalyze.map((item) => ({
        title: item.title,
        content: item.content,
        candidateTopicIds: item.candidateTopicIds,
        topicOverrides,
      }))
    ),
  ])

  // Merge fetched images back in
  for (let i = 0; i < toAnalyze.length; i++) {
    if (needsImage[i] && ogImages[i]) {
      toAnalyze[i] = { ...toAnalyze[i], imageUrl: ogImages[i] }
    }
  }
  log.info('og:image + Claude done')

  // ── 9. Build insert arrays (pre-generate UUIDs to avoid sequential round-trips)
  type ArticleRow = {
    id: string
    title: string
    url: string
    source_domain: string
    published_at: string | null
    raw_content: string
    image_url: string | null
  }
  type SummaryRow = { article_id: string; bullets: string[]; one_liner: string; is_breaking: boolean }
  type TopicRow = { article_id: string; topic_id: string; relevance_score: number }
  type CrossFlagRow = { article_id: string; topic_ids: string[]; reason: string }

  const articleRows: ArticleRow[] = []
  const summaryRows: SummaryRow[] = []
  const topicRows: TopicRow[] = []
  const crossFlagRows: CrossFlagRow[] = []
  const breakingArticleIds: string[] = []

  for (let i = 0; i < toAnalyze.length; i++) {
    const item = toAnalyze[i]
    const analysis = analyses[i]

    const relevantTopics = Object.entries(analysis.topic_scores).filter(([, score]) => score >= 0.3)
    if (relevantTopics.length === 0) continue

    const id = crypto.randomUUID()

    articleRows.push({
      id,
      title: item.title,
      url: item.url,
      source_domain: item.sourceDomain,
      published_at: item.publishedAt?.toISOString() ?? null,
      raw_content: item.content,
      image_url: item.imageUrl ?? null,
    })

    summaryRows.push({
      article_id: id,
      bullets: analysis.bullets,
      one_liner: analysis.one_liner,
      is_breaking: analysis.is_breaking,
    })

    for (const [topicId, score] of relevantTopics) {
      topicRows.push({ article_id: id, topic_id: topicId, relevance_score: score })
    }

    if (analysis.cross_topic_ids && analysis.cross_topic_reason) {
      crossFlagRows.push({
        article_id: id,
        topic_ids: analysis.cross_topic_ids,
        reason: analysis.cross_topic_reason,
      })
    }

    if (analysis.is_breaking) breakingArticleIds.push(id)
  }

  // ── 10. 4 bulk inserts instead of ~400 sequential queries ────────────────────
  log.info('Bulk inserting', {
    articles: articleRows.length,
    summaries: summaryRows.length,
    topics: topicRows.length,
    crossFlags: crossFlagRows.length,
  })

  // Insert articles — upsert with ignoreDuplicates handles any race-condition dupes
  const { data: insertedArticles } = await supabase
    .from('articles')
    .upsert(articleRows, { onConflict: 'url', ignoreDuplicates: true })
    .select('id')

  // Only write dependent rows for articles that were actually inserted
  const insertedIds = new Set((insertedArticles ?? []).map((a: { id: string }) => a.id))
  const ingested = insertedIds.size

  if (ingested > 0) {
    const validSummaries = summaryRows.filter((r) => insertedIds.has(r.article_id))
    const validTopics = topicRows.filter((r) => insertedIds.has(r.article_id))
    const validCrossFlags = crossFlagRows.filter((r) => insertedIds.has(r.article_id))

    await Promise.all([
      supabase.from('article_summaries').insert(validSummaries),
      supabase.from('article_topics').insert(validTopics),
      validCrossFlags.length > 0
        ? supabase.from('cross_topic_flags').insert(validCrossFlags)
        : Promise.resolve(),
    ])
  }

  const breaking = breakingArticleIds.filter((id) => insertedIds.has(id)).length
  log.info('Ingestion complete', { ingested, breaking, analyzed: toAnalyze.length })

  return { ingested, breaking, analyzed: toAnalyze.length, breakingArticleIds: breakingArticleIds.filter((id) => insertedIds.has(id)) }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function interleaveByTopic<T extends { candidateTopicIds: string[] }>(
  items: T[],
  limit: number
): T[] {
  const byTopic = new Map<string, T[]>()
  for (const item of items) {
    const key = item.candidateTopicIds[0] ?? '__unknown__'
    if (!byTopic.has(key)) byTopic.set(key, [])
    byTopic.get(key)!.push(item)
  }

  const groups = [...byTopic.values()]
  const result: T[] = []
  let round = 0

  while (result.length < limit) {
    let added = 0
    for (const group of groups) {
      if (result.length >= limit) break
      if (round < group.length) {
        result.push(group[round])
        added++
      }
    }
    if (added === 0) break
    round++
  }

  return result
}
