/**
 * Core ingestion pipeline — shared by the API route (manual trigger)
 * and the Trigger.dev scheduled task.
 *
 * Architecture:
 *  A. Regular pipeline  — RSS + Twitter + NewsAPI → dedup → top 60 → Claude → bulk insert
 *  B. Custom topic pipeline — separate pass per custom topic, own 25-article budget,
 *     never competes with regular topics. Also retroactively tags existing articles
 *     that were already in DB under a different topic.
 *
 * Key fixes:
 *  - published_at null → fallback to NOW() so articles always appear in feed queries
 *  - Custom topics get dedicated analysis budget (25 articles each), not shared with the 60-cap
 *  - og:image + Claude analysis run in PARALLEL
 *  - Claude uses worker-pool (not sequential batches) — no straggler penalty
 *  - 4 bulk Supabase inserts instead of ~N sequential queries
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchRssFeed } from '@/lib/sources/rss'
import { fetchNewsApiForTopic } from '@/lib/sources/newsapi'
import { searchTwitter } from '@/lib/sources/twitter'
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
  info:  (msg: string, ctx?: object) => console.log(`[ingest] ${msg}`,  ctx ?? ''),
  warn:  (msg: string, ctx?: object) => console.warn(`[ingest] ${msg}`,  ctx ?? ''),
  error: (msg: string, ctx?: object) => console.error(`[ingest] ${msg}`, ctx ?? ''),
}

// Twitter search queries per predefined topic
const TOPIC_TWITTER_QUERIES: Record<string, string> = {
  'ai-agi':             'AI AGI OpenAI Anthropic GPT',
  'cybersecurity':      'cybersecurity breach hacked malware',
  'blockchain-crypto':  'bitcoin ethereum crypto DeFi',
  'consumer-tech':      'Apple Google Samsung tech launch',
  'robotics':           'robotics humanoid robot automation',
  'social-media-tech':  'Meta TikTok Twitter content moderation',
  'ai-commercial-law':  'AI regulation law EU AI Act',
  'gambling-gaming-law':'gambling regulation sports betting law',
  'data-privacy':       'GDPR data breach privacy regulation',
  'elections':          'election vote democracy ballot',
  'human-rights':       'human rights civil liberties protest',
  'immigration':        'immigration border asylum migration',
  'stock-market':       'stocks market Wall Street earnings S&P',
  'vc-startups':        'startup funding VC venture capital raise',
  'global-economy':     'economy inflation interest rates GDP',
  'real-estate':        'real estate housing market property',
  'trade-tariffs':      'tariffs trade war sanctions WTO',
  'emerging-markets':   'emerging markets BRICS China India Brazil',
  'biotech-health':     'biotech FDA clinical trial drug approval',
  'science':            'science research discovery physics biology',
  'mental-health':      'mental health depression anxiety therapy',
  'health-wellness':    'health wellness nutrition medicine',
  'pharma':             'pharma drug FDA approval clinical',
  'nuclear':            'nuclear energy fusion reactor power plant',
  'climate-energy':     'climate change renewable energy solar wind',
  'environment':        'environment biodiversity wildlife conservation',
  'agriculture':        'agriculture farming food security crops',
  'us-politics':        'US politics Congress White House Senate',
  'geopolitics':        'geopolitics foreign policy NATO UN war',
  'military':           'military defense Pentagon army navy',
  'space-defense':      'SpaceX NASA space rocket satellite',
  'entertainment':      'entertainment celebrity awards pop culture',
  'film-tv':            'movie film Netflix streaming box office',
  'gaming-esports':     'gaming esports video games release',
  'sports':             'sports NFL NBA soccer Premier League',
  'classical-opera':    'classical music opera orchestra symphony',
  'literature':         'books publishing author novel literature',
  'art-design':         'art gallery museum design exhibition',
  'architecture':       'architecture urban design building city',
  'food-drink':         'food restaurant chef culinary wine',
  'fashion-luxury':     'fashion luxury brands fashion week',
  'travel':             'travel tourism destination airline hotel',
  'judaism':            'Israel Jewish Judaism diaspora synagogue',
  'religion':           'religion faith church Islam Buddhism',
  'philosophy':         'philosophy ethics moral political theory',
  'automotive-ev':      'Tesla EV electric vehicle car automotive',
  'aviation':           'aviation airline airport flight aircraft',
  'media-journalism':   'journalism media press freedom newsroom',
  'labor':              'labor union workers strike wages employment',
  'education':          'education university school EdTech',
}

export async function runIngestion(supabase: SupabaseClient): Promise<IngestionResult> {
  // ── Fetch custom topics first — needed by both pipelines ────────────────────
  const { data: customTopicRows } = await supabase
    .from('user_custom_topics')
    .select('slug, name')

  const uniqueCustomTopics = new Map<string, string>()
  for (const ct of customTopicRows ?? []) {
    if (!uniqueCustomTopics.has(ct.slug)) uniqueCustomTopics.set(ct.slug, ct.name)
  }

  const topicOverrides: Record<string, TopicMeta> = {}
  for (const [slug, name] of uniqueCustomTopics) {
    topicOverrides[slug] = { name, description: `Custom topic: ${name}` }
  }

  // ── Run both pipelines in parallel ──────────────────────────────────────────
  const [mainResult, customResult] = await Promise.all([
    runMainPipeline(supabase, uniqueCustomTopics, topicOverrides),
    runCustomTopicPipeline(supabase, uniqueCustomTopics, topicOverrides),
  ])

  const ingested = mainResult.ingested + customResult.ingested
  const breaking = mainResult.breaking + customResult.breaking
  const analyzed = mainResult.analyzed + customResult.analyzed
  const breakingArticleIds = [...mainResult.breakingArticleIds, ...customResult.breakingArticleIds]

  log.info('Total ingestion complete', { ingested, breaking, analyzed })

  if (ingested === 0) {
    return { ingested: 0, breaking: 0, analyzed, breakingArticleIds: [], message: 'No new articles — all already in DB' }
  }

  return { ingested, breaking, analyzed, breakingArticleIds }
}

// ── Pipeline A: Regular RSS + Twitter + NewsAPI ───────────────────────────────

async function runMainPipeline(
  supabase: SupabaseClient,
  uniqueCustomTopics: Map<string, string>,
  topicOverrides: Record<string, TopicMeta>
): Promise<IngestionResult> {
  const allItems: IngestItem[] = []

  // 1. RSS feeds
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

  // 2. Twitter
  const { data: allUserTopicRows } = await supabase
    .from('user_topics')
    .select('topic_id')
  const activeTopicIds = [...new Set((allUserTopicRows ?? []).map((r: { topic_id: string }) => r.topic_id))]

  const twitterQueries = activeTopicIds
    .filter((id) => TOPIC_TWITTER_QUERIES[id])
    .map((id) => ({ query: TOPIC_TWITTER_QUERIES[id], topicId: id }))

  if (twitterQueries.length > 0) {
    log.info('Fetching Twitter (predefined topics)', { queries: twitterQueries.length })
    const twitterResults = await Promise.allSettled(
      twitterQueries.map(({ query, topicId }) =>
        searchTwitter(query, topicId, 15).then((items) =>
          items.map((item) => ({ ...item, candidateTopicIds: [topicId] }))
        )
      )
    )
    for (const r of twitterResults) {
      if (r.status === 'fulfilled') allItems.push(...r.value)
    }
    log.info('Twitter done', { total: allItems.length })
  }

  // 3. NewsAPI
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

  // 4. Age filter — keep only items from last 3 days (nulls pass through)
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000
  const recentItems = allItems.filter(
    (item) => !item.publishedAt || item.publishedAt.getTime() >= cutoff
  )
  log.info('After age filter', { kept: recentItems.length, dropped: allItems.length - recentItems.length })

  // 5. Deduplicate — exclude custom topic items (handled by dedicated pipeline)
  const regularItems = recentItems.filter(
    (item) => !uniqueCustomTopics.has(item.candidateTopicIds[0] ?? '')
  )
  const newItems = await filterNewArticles(supabase, regularItems)
  log.info('New regular articles after dedup', { count: newItems.length })

  if (newItems.length === 0) {
    return { ingested: 0, breaking: 0, analyzed: 0, breakingArticleIds: [] }
  }

  // 6. Append custom topic IDs to every item so they get scored alongside regular topics
  const customTopicIds = [...uniqueCustomTopics.keys()]
  const itemsWithCustom = customTopicIds.length === 0 ? newItems : newItems.map((item) => ({
    ...item,
    candidateTopicIds: [...new Set([...item.candidateTopicIds, ...customTopicIds])],
  }))

  // 7. Interleave — fair coverage across predefined topics, cap at 35
  const toAnalyze = interleaveByTopic(itemsWithCustom, 35)
  log.info('Selected for analysis', { count: toAnalyze.length })

  return bulkAnalyzeAndInsert(supabase, toAnalyze, topicOverrides, 'main')
}

// ── Pipeline B: Custom topics — dedicated budget, never competes ──────────────

async function runCustomTopicPipeline(
  supabase: SupabaseClient,
  uniqueCustomTopics: Map<string, string>,
  topicOverrides: Record<string, TopicMeta>
): Promise<IngestionResult> {
  if (uniqueCustomTopics.size === 0) {
    return { ingested: 0, breaking: 0, analyzed: 0, breakingArticleIds: [] }
  }

  log.info('Custom topic pipeline', { topics: uniqueCustomTopics.size })

  // Fetch RSS + Twitter for each custom topic in parallel
  const PER_TOPIC_RSS   = 40  // articles from Google News RSS
  const PER_TOPIC_TWEETS = 15 // tweets from Twitter search
  const PER_TOPIC_CAP   = 25  // max articles analyzed per topic after dedup

  const allCustomItems: IngestItem[] = []

  const fetchResults = await Promise.allSettled(
    [...uniqueCustomTopics.entries()].flatMap(([slug, name]) => {
      const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(name)}&hl=en-US&gl=US&ceid=US:en`
      return [
        fetchRssFeed(googleNewsUrl, `Custom: ${name}`, PER_TOPIC_RSS).then((items) =>
          items.map((item) => ({ ...item, candidateTopicIds: [slug] }))
        ),
        searchTwitter(name, name, PER_TOPIC_TWEETS).then((items) =>
          items.map((item) => ({ ...item, candidateTopicIds: [slug] }))
        ),
      ]
    })
  )
  for (const r of fetchResults) {
    if (r.status === 'fulfilled') allCustomItems.push(...r.value)
  }

  log.info('Custom topic items fetched', { total: allCustomItems.length })

  if (allCustomItems.length === 0) {
    return { ingested: 0, breaking: 0, analyzed: 0, breakingArticleIds: [] }
  }

  // Age filter
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000
  const recentCustomItems = allCustomItems.filter(
    (item) => !item.publishedAt || item.publishedAt.getTime() >= cutoff
  )

  // Retroactive tagging: articles already in DB get their custom topic row added
  await retroactivelyTagExistingArticles(supabase, recentCustomItems)

  // Dedup — only keep articles not yet in DB
  const newCustomItems = await filterNewArticles(supabase, recentCustomItems)
  log.info('New custom topic articles after dedup', { count: newCustomItems.length })

  if (newCustomItems.length === 0) {
    return { ingested: 0, breaking: 0, analyzed: 0, breakingArticleIds: [] }
  }

  // Cap per topic for analysis — take top PER_TOPIC_CAP per slug
  const toAnalyze = interleaveByTopic(newCustomItems, uniqueCustomTopics.size * PER_TOPIC_CAP)
  log.info('Custom articles selected for analysis', { count: toAnalyze.length })

  return bulkAnalyzeAndInsert(supabase, toAnalyze, topicOverrides, 'custom')
}

// ── Retroactive tagging ───────────────────────────────────────────────────────
// For articles already in DB that came from a custom topic feed,
// add an article_topics row so they appear under that topic.

async function retroactivelyTagExistingArticles(
  supabase: SupabaseClient,
  items: IngestItem[]
): Promise<void> {
  if (items.length === 0) return

  // Match by URL first, then fall back to title (Google News uses different redirect
  // URLs per search query, so the same article may have a different URL in the DB)
  const urls = items.map((i) => i.url)
  const titles = items.map((i) => i.title)

  const [{ data: byUrl }, { data: byTitle }] = await Promise.all([
    supabase.from('articles').select('id, url').in('url', urls),
    supabase.from('articles').select('id, title').in('title', titles),
  ])

  const articleToId: Record<string, string> = {}
  for (const a of byUrl as { id: string; url: string }[] ?? []) {
    articleToId[a.url] = a.id
  }
  // Title-based fallback — build a map from title → item for lookup
  const titleToItem: Record<string, IngestItem> = {}
  for (const item of items) titleToItem[item.title] = item
  for (const a of byTitle as { id: string; title: string }[] ?? []) {
    const item = titleToItem[a.title]
    if (item && !articleToId[item.url]) articleToId[item.url] = a.id
  }

  const matchedIds = [...new Set(Object.values(articleToId))]
  if (matchedIds.length === 0) return

  const { data: alreadyTagged } = await supabase
    .from('article_topics')
    .select('article_id, topic_id')
    .in('article_id', matchedIds)

  const taggedSet = new Set(
    (alreadyTagged ?? []).map((r: { article_id: string; topic_id: string }) =>
      `${r.article_id}:${r.topic_id}`
    )
  )

  const newTags = items
    .filter((item) => {
      const id = articleToId[item.url]
      const slug = item.candidateTopicIds[0]
      return id && slug && !taggedSet.has(`${id}:${slug}`)
    })
    .map((item) => ({
      article_id: articleToId[item.url],
      topic_id: item.candidateTopicIds[0],
      relevance_score: 0.85,
    }))

  if (newTags.length > 0) {
    await supabase.from('article_topics').insert(newTags)
    log.info('Retroactive tags added', { count: newTags.length })
  }
}

// ── Shared: analyze + bulk insert ────────────────────────────────────────────

async function bulkAnalyzeAndInsert(
  supabase: SupabaseClient,
  toAnalyze: IngestItem[],
  topicOverrides: Record<string, TopicMeta>,
  label: string
): Promise<IngestionResult> {
  // og:image + Claude in parallel
  const needsImage   = toAnalyze.map((item) => !item.imageUrl)
  const urlsToFetch  = toAnalyze.map((item, i) => (needsImage[i] ? item.url : ''))

  log.info(`[${label}] og:image + Claude in parallel`, {
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

  for (let i = 0; i < toAnalyze.length; i++) {
    if (needsImage[i] && ogImages[i]) {
      toAnalyze[i] = { ...toAnalyze[i], imageUrl: ogImages[i] }
    }
  }

  type ArticleRow  = { id: string; title: string; url: string; source_domain: string; published_at: string | null; raw_content: string; image_url: string | null }
  type SummaryRow  = { article_id: string; bullets: string[]; one_liner: string; is_breaking: boolean }
  type TopicRow    = { article_id: string; topic_id: string; relevance_score: number }
  type CrossFlagRow = { article_id: string; topic_ids: string[]; reason: string }

  const articleRows:   ArticleRow[]   = []
  const summaryRows:   SummaryRow[]   = []
  const topicRows:     TopicRow[]     = []
  const crossFlagRows: CrossFlagRow[] = []
  const breakingArticleIds: string[]  = []
  const now = new Date().toISOString()

  for (let i = 0; i < toAnalyze.length; i++) {
    const item     = toAnalyze[i]
    const analysis = analyses[i]

    const relevantTopics = Object.entries(analysis.topic_scores).filter(([, score]) => score >= 0.3)
    if (relevantTopics.length === 0) continue

    const id = crypto.randomUUID()

    articleRows.push({
      id,
      title: item.title,
      url: item.url,
      source_domain: item.sourceDomain,
      // Fall back to NOW() if publishedAt is null — ensures article always surfaces in feed
      published_at: item.publishedAt?.toISOString() ?? now,
      raw_content: item.content,
      image_url: item.imageUrl ?? null,
    })

    summaryRows.push({
      article_id: id,
      bullets:    analysis.bullets,
      one_liner:  analysis.one_liner,
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

  log.info(`[${label}] Bulk inserting`, {
    articles: articleRows.length,
    summaries: summaryRows.length,
    topics: topicRows.length,
  })

  const { data: insertedArticles } = await supabase
    .from('articles')
    .upsert(articleRows, { onConflict: 'url', ignoreDuplicates: true })
    .select('id')

  const insertedIds = new Set((insertedArticles ?? []).map((a: { id: string }) => a.id))
  const ingested    = insertedIds.size

  if (ingested > 0) {
    const validSummaries  = summaryRows.filter((r) => insertedIds.has(r.article_id))
    const validTopics     = topicRows.filter((r) => insertedIds.has(r.article_id))
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
  log.info(`[${label}] Done`, { ingested, breaking, analyzed: toAnalyze.length })

  return {
    ingested,
    breaking,
    analyzed: toAnalyze.length,
    breakingArticleIds: breakingArticleIds.filter((id) => insertedIds.has(id)),
  }
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
