import Anthropic from '@anthropic-ai/sdk'
import { TOPICS } from '@/lib/topics'

// Simple logger that works both inside and outside Trigger.dev tasks
const logger = {
  error: (msg: string, ctx?: object) => console.error(msg, ctx ?? ''),
  warn: (msg: string, ctx?: object) => console.warn(msg, ctx ?? ''),
  info: (msg: string, ctx?: object) => console.log(msg, ctx ?? ''),
}

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey })
}

// Global ticket-based rate limiter — max ~38 req/min across all concurrent callers.
// Each caller grabs a unique time-slot, advancing the queue atomically before awaiting.
let _nextSlotAt = 0
const RATE_INTERVAL_MS = 1600 // ~37.5 req/min, safely under the 50/min org limit

async function acquireSlot() {
  const mySlot = Math.max(Date.now(), _nextSlotAt)
  _nextSlotAt = mySlot + RATE_INTERVAL_MS
  const wait = mySlot - Date.now()
  if (wait > 0) await new Promise<void>((r) => setTimeout(r, wait))
}

export type ArticleAnalysis = {
  bullets: string[]
  one_liner: string
  is_breaking: boolean
  topic_scores: Record<string, number>
  cross_topic_ids: string[] | null
  cross_topic_reason: string | null
}

const EMPTY_ANALYSIS = (title: string): ArticleAnalysis => ({
  bullets: [],
  one_liner: title,
  is_breaking: false,
  topic_scores: {},
  cross_topic_ids: null,
  cross_topic_reason: null,
})

export type TopicMeta = { name: string; description: string }

export async function analyzeArticle(
  title: string,
  content: string,
  candidateTopicIds: string[],
  topicOverrides: Record<string, TopicMeta> = {}
): Promise<ArticleAnalysis> {
  const candidateTopics = candidateTopicIds.map((id) => {
    const t = TOPICS.find((t) => t.id === id)
    if (t) return { id: t.id, name: t.name, description: t.description }
    const override = topicOverrides[id]
    if (override) return { id, name: override.name, description: override.description }
    return null
  }).filter(Boolean) as { id: string; name: string; description: string }[]
  if (candidateTopics.length === 0) return EMPTY_ANALYSIS(title)

  const topicList = candidateTopics.map((t) => `${t.id}: ${t.name}`).join('\n')

  const prompt = `Analyze this news article and return JSON:
{"bullets":["<15w>","<15w>"],"one_liner":"<12w>","is_breaking":<bool>,"topic_scores":{<id>:<0-1>},"cross_topic_ids":<[ids]|null>,"cross_topic_reason":<"str"|null>}

Rules:
- bullets: 2-3 key facts, max 15 words each
- one_liner: core story, max 12 words
- is_breaking: true only for major breaking news (landmark ruling, major attack, market crash, etc.)
- topic_scores: score ONLY the topics listed below, 0=irrelevant 0.5=relevant 1=highly relevant
- cross_topic_ids: list 2+ topic IDs if article spans multiple topics, else null

Topics:
${topicList}

Title: ${title}
Content: ${content.slice(0, 600)}

JSON only.`

  let text = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await acquireSlot()
      const message = await getClient().messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      })
      text = message.content[0].type === 'text' ? message.content[0].text : ''
      break
    } catch (err: unknown) {
      const isRateLimit = String(err).includes('429') || String(err).includes('rate_limit')
      if (isRateLimit && attempt < 2) {
        logger.warn('Rate limited — waiting 15s before retry', { title, attempt })
        await new Promise<void>((r) => setTimeout(r, 15_000))
        continue
      }
      logger.error('Claude API call failed', { title, error: String(err) })
      return EMPTY_ANALYSIS(title)
    }
  }

  // Strip markdown code fences Claude sometimes adds despite instructions
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as Partial<ArticleAnalysis>
    const validTopicIds = new Set(candidateTopicIds)

    return {
      bullets: Array.isArray(parsed.bullets)
        ? parsed.bullets.slice(0, 3).map(String)
        : [],
      one_liner: typeof parsed.one_liner === 'string' ? parsed.one_liner : title,
      is_breaking: parsed.is_breaking === true,
      topic_scores: Object.fromEntries(
        Object.entries(parsed.topic_scores ?? {}).filter(
          ([id, score]) => validTopicIds.has(id) && typeof score === 'number'
        )
      ),
      cross_topic_ids:
        Array.isArray(parsed.cross_topic_ids) && parsed.cross_topic_ids.length >= 2
          ? parsed.cross_topic_ids.filter((id) => validTopicIds.has(String(id)))
          : null,
      cross_topic_reason:
        typeof parsed.cross_topic_reason === 'string' ? parsed.cross_topic_reason : null,
    }
  } catch {
    logger.warn('Claude returned unparseable JSON', { title, raw: text.slice(0, 200) })
    return EMPTY_ANALYSIS(title)
  }
}

export async function analyzeArticlesBatch(
  articles: Array<{ title: string; content: string; candidateTopicIds: string[]; topicOverrides?: Record<string, TopicMeta> }>
): Promise<ArticleAnalysis[]> {
  const CONCURRENCY = 8
  const results: ArticleAnalysis[] = new Array(articles.length)
  let cursor = 0

  async function worker() {
    while (cursor < articles.length) {
      const i = cursor++
      const a = articles[i]
      try {
        results[i] = await analyzeArticle(a.title, a.content, a.candidateTopicIds, a.topicOverrides)
      } catch (err) {
        logger.error('analyzeArticle failed', { title: a.title, error: String(err) })
        results[i] = EMPTY_ANALYSIS(a.title)
      }
    }
  }

  const poolSize = Math.min(CONCURRENCY, articles.length)
  if (poolSize > 0) {
    await Promise.all(Array.from({ length: poolSize }, worker))
  }

  return results
}
