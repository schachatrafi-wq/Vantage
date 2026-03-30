import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { fetchRssFeed } from '@/lib/sources/rss'
import { fetchNewsApiForTopic } from '@/lib/sources/newsapi'
import { filterNewArticles } from '@/lib/ingestion/dedupe'
import { analyzeArticlesBatch } from '@/lib/ingestion/analyze'
import { batchFetchOgImages } from '@/lib/sources/ogimage'
import { RSS_FEEDS } from '@/lib/sources/feeds'
import { TOPICS } from '@/lib/topics'

export const maxDuration = 300

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()

  type IngestItem = {
    title: string
    url: string
    sourceDomain: string
    publishedAt: Date | null
    content: string
    imageUrl: string | null
    candidateTopicIds: string[]
  }

  const allItems: IngestItem[] = []

  // 1. Fetch RSS feeds
  console.log('Fetching RSS feeds...')
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
  console.log(`RSS done: ${allItems.length} items`)

  // 2. Fetch NewsAPI
  const newsApiKey = process.env.NEWS_API_KEY
  if (newsApiKey) {
    console.log('Fetching NewsAPI...')
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
    console.log(`NewsAPI done: ${allItems.length} items total`)
  }

  // 3. Drop articles older than 3 days before dedup / analysis
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000
  const recentItems = allItems.filter(
    (item) => !item.publishedAt || item.publishedAt.getTime() >= cutoff
  )
  console.log(`After age filter: ${recentItems.length} items (dropped ${allItems.length - recentItems.length} old)`)

  // 4. Deduplicate
  const newItems = await filterNewArticles(supabase, recentItems)
  console.log(`New after dedup: ${newItems.length}`)

  if (newItems.length === 0) {
    return NextResponse.json({ ingested: 0, breaking: 0, message: 'No new articles — all already in DB' })
  }

  // 5. Fetch og:image for articles that don't already have one from their feed
  const needsImage = newItems.map((item) => !item.imageUrl)
  const urlsToFetch = newItems.map((item, i) => (needsImage[i] ? item.url : ''))
  console.log(`Fetching og:images for ${needsImage.filter(Boolean).length} articles...`)
  const ogImages = await batchFetchOgImages(urlsToFetch, 25)
  for (let i = 0; i < newItems.length; i++) {
    if (needsImage[i] && ogImages[i]) {
      newItems[i] = { ...newItems[i], imageUrl: ogImages[i] }
    }
  }
  console.log(`og:image fetch done`)

  // 5. Interleave by primary topic so every topic gets proportional coverage
  //    (without this, topics early in the feed list consume the entire analysis budget)
  const toAnalyze = interleaveByTopic(newItems, 150)
  console.log(`Analyzing ${toAnalyze.length} articles with Claude...`)

  const analyses = await analyzeArticlesBatch(
    toAnalyze.map((item) => ({
      title: item.title,
      content: item.content,
      candidateTopicIds: item.candidateTopicIds,
    }))
  )

  // 5. Store in Supabase
  let ingested = 0
  let breaking = 0

  for (let i = 0; i < toAnalyze.length; i++) {
    const item = toAnalyze[i]
    const analysis = analyses[i]

    const relevantTopics = Object.entries(analysis.topic_scores).filter(([, score]) => score >= 0.3)
    if (relevantTopics.length === 0) continue

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title: item.title,
        url: item.url,
        source_domain: item.sourceDomain,
        published_at: item.publishedAt?.toISOString() ?? null,
        raw_content: item.content,
        image_url: item.imageUrl ?? null,
      })
      .select('id')
      .single()

    if (articleError || !article) continue

    await supabase.from('article_summaries').insert({
      article_id: article.id,
      bullets: analysis.bullets,
      one_liner: analysis.one_liner,
      is_breaking: analysis.is_breaking,
    })

    await supabase.from('article_topics').insert(
      relevantTopics.map(([topicId, score]) => ({
        article_id: article.id,
        topic_id: topicId,
        relevance_score: score,
      }))
    )

    if (analysis.cross_topic_ids && analysis.cross_topic_reason) {
      await supabase.from('cross_topic_flags').insert({
        article_id: article.id,
        topic_ids: analysis.cross_topic_ids,
        reason: analysis.cross_topic_reason,
      })
    }

    ingested++
    if (analysis.is_breaking) breaking++
  }

  console.log(`Done: ${ingested} ingested, ${breaking} breaking`)
  return NextResponse.json({ ingested, breaking, analyzed: toAnalyze.length })
}

/**
 * Round-robins through topics so every topic gets proportional analysis coverage.
 * Without this, topics early in the feed list exhaust the analysis budget.
 */
function interleaveByTopic<T extends { candidateTopicIds: string[] }>(
  items: T[],
  limit: number
): T[] {
  // Group by primary topic
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
