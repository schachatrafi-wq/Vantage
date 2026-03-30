import { schedules, task, logger } from '@trigger.dev/sdk/v3'
import { createServerClient } from '@/lib/supabase/server'
import { fetchRssFeed, fetchNitterFeed } from '@/lib/sources/rss'
import { fetchNewsApiForTopic } from '@/lib/sources/newsapi'
import { filterNewArticles } from '@/lib/ingestion/dedupe'
import { analyzeArticlesBatch } from '@/lib/ingestion/analyze'
import { RSS_FEEDS } from '@/lib/sources/feeds'
import { TOPIC_X_ACCOUNTS } from '@/lib/sources/accounts'
import { TOPICS } from '@/lib/topics'

// Runs every 4 hours
export const ingestNewsTask = schedules.task({
  id: 'ingest-news',
  cron: '0 */4 * * *',
  maxDuration: 240,
  run: async () => {
    logger.info('Starting news ingestion')
    const supabase = createServerClient()

    type IngestItem = {
      title: string
      url: string
      source: string
      sourceDomain: string
      publishedAt: Date | null
      content: string
      candidateTopicIds: string[]
    }
    const allItems: IngestItem[] = []

    // 1. Fetch RSS feeds (grouped by topic)
    logger.info('Fetching RSS feeds', { count: RSS_FEEDS.length })
    const rssFetches = RSS_FEEDS.map((feed) =>
      fetchRssFeed(feed.url, feed.label).then((items) =>
        items.map((item) => ({ ...item, candidateTopicIds: feed.topicIds }))
      )
    )
    const rssResults = await Promise.all(rssFetches)
    for (const items of rssResults) {
      allItems.push(...items)
    }
    logger.info('RSS fetched', { total: allItems.length })

    // 2. Fetch NewsAPI for each active topic
    const newsApiKey = process.env.NEWS_API_KEY
    if (newsApiKey) {
      logger.info('Fetching NewsAPI')
      const newsFetches = TOPICS.map((topic) =>
        fetchNewsApiForTopic(topic.id, newsApiKey).then((items) =>
          items.map((item) => ({ ...item, candidateTopicIds: [topic.id] }))
        )
      )
      const newsResults = await Promise.all(newsFetches)
      for (const items of newsResults) {
        allItems.push(...items)
      }
      logger.info('NewsAPI fetched', { total: allItems.length })
    }

    // 3. Fetch Nitter RSS for X accounts (best-effort)
    logger.info('Fetching Nitter RSS')
    const nitterFetches: Promise<void>[] = []
    for (const [topicId, accounts] of Object.entries(TOPIC_X_ACCOUNTS)) {
      for (const account of accounts) {
        nitterFetches.push(
          fetchNitterFeed(account.username, account.label).then((items) => {
            allItems.push(
              ...items.map((item) => ({ ...item, candidateTopicIds: [topicId] }))
            )
          })
        )
      }
    }
    await Promise.allSettled(nitterFetches)
    logger.info('Nitter fetched', { total: allItems.length })

    // 4. Deduplicate against existing articles
    const newItems = await filterNewArticles(supabase, allItems)
    logger.info('New articles after dedup', { count: newItems.length })

    if (newItems.length === 0) {
      logger.info('No new articles to process')
      return { ingested: 0, breaking: 0 }
    }

    // 5. Analyze with Claude (in batches of 5, concurrently)
    logger.info('Analyzing with Claude', { count: newItems.length })
    const analyses = await analyzeArticlesBatch(
      newItems.map((item) => ({
        title: item.title,
        content: item.content,
        candidateTopicIds: item.candidateTopicIds,
      }))
    )

    // 6. Store results in Supabase
    let breakingCount = 0
    const breakingArticleIds: string[] = []

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i]
      const analysis = analyses[i]

      // Filter out articles with no relevant topics (all scores < 0.3)
      const relevantTopics = Object.entries(analysis.topic_scores).filter(
        ([, score]) => score >= 0.3
      )
      if (relevantTopics.length === 0) continue

      // Insert article
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          title: item.title,
          url: item.url,
          source_domain: item.sourceDomain,
          published_at: item.publishedAt?.toISOString() ?? null,
          raw_content: item.content,
        })
        .select('id')
        .single()

      if (articleError || !article) {
        if (articleError?.code !== '23505') {
          logger.error('Failed to insert article', { error: articleError?.message, url: item.url })
        }
        continue
      }

      const articleId = article.id

      // Insert summary
      await supabase.from('article_summaries').insert({
        article_id: articleId,
        bullets: analysis.bullets,
        one_liner: analysis.one_liner,
        is_breaking: analysis.is_breaking,
      })

      // Insert topic associations
      if (relevantTopics.length > 0) {
        await supabase.from('article_topics').insert(
          relevantTopics.map(([topicId, score]) => ({
            article_id: articleId,
            topic_id: topicId,
            relevance_score: score,
          }))
        )
      }

      // Insert cross-topic flag
      if (analysis.cross_topic_ids && analysis.cross_topic_reason) {
        await supabase.from('cross_topic_flags').insert({
          article_id: articleId,
          topic_ids: analysis.cross_topic_ids,
          reason: analysis.cross_topic_reason,
        })
      }

      if (analysis.is_breaking) {
        breakingCount++
        breakingArticleIds.push(articleId)
      }
    }

    logger.info('Ingestion complete', { ingested: newItems.length, breaking: breakingCount })

    // 7. Trigger breaking news notifications if any
    if (breakingArticleIds.length > 0) {
      await sendBreakingNotificationsTask.trigger({ articleIds: breakingArticleIds })
    }

    return { ingested: newItems.length, breaking: breakingCount }
  },
})

// Breaking news notification task (triggered by ingestion)
export const sendBreakingNotificationsTask = task({
  id: 'send-breaking-notifications',
  maxDuration: 120,
  run: async ({ articleIds }: { articleIds: string[] }) => {
    logger.info('Sending breaking notifications', { count: articleIds.length })
    const supabase = createServerClient()

    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, source_domain, article_topics(topic_id)')
      .in('id', articleIds)

    if (!articles || articles.length === 0) return

    for (const article of articles) {
      const topicIds = (article.article_topics as { topic_id: string }[]).map((t) => t.topic_id)
      if (topicIds.length === 0) continue

      // Get subscribers for any of these topics
      const { data: subscribers } = await supabase
        .from('user_topics')
        .select('user_id')
        .in('topic_id', topicIds)

      if (!subscribers || subscribers.length === 0) continue

      const userIds = [...new Set(subscribers.map((s) => s.user_id))]

      // Get push subscriptions for these users
      const { data: pushSubs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .in('user_id', userIds)

      if (!pushSubs || pushSubs.length === 0) continue

      // Send push notifications
      const payload = JSON.stringify({
        title: '🔴 Breaking News — Vantage',
        body: article.title.slice(0, 100),
        data: { articleId: article.id },
      })

      await Promise.allSettled(
        pushSubs.map((sub) =>
          sendWebPush(sub.endpoint, sub.p256dh, sub.auth, payload)
        )
      )
    }
  },
})

async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string
): Promise<void> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    logger.warn('VAPID keys not configured, skipping push')
    return
  }

  const { default: webpush } = await import('web-push')
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  await webpush.sendNotification(
    { endpoint, keys: { p256dh, auth } },
    payload
  )
}
