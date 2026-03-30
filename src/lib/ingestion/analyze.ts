import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@trigger.dev/sdk/v3'
import { TOPICS } from '@/lib/topics'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

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

export async function analyzeArticle(
  title: string,
  content: string,
  candidateTopicIds: string[]
): Promise<ArticleAnalysis> {
  const candidateTopics = TOPICS.filter((t) => candidateTopicIds.includes(t.id))
  if (candidateTopics.length === 0) return EMPTY_ANALYSIS(title)

  const topicList = candidateTopics.map((t) => `- ${t.id}: ${t.name} — ${t.description}`).join('\n')

  const prompt = `You are an expert news analyst for a personalized intelligence platform called Vantage.

Analyze the following article and return a JSON object with these fields:

- **bullets**: Array of 2-3 concise bullet points (each max 20 words) summarizing the key facts. Be precise and informative.
- **one_liner**: Single sentence (max 15 words) capturing the core story.
- **is_breaking**: Boolean. True only if this is genuinely significant breaking news that warrants immediate notification (major policy change, significant market event, landmark court ruling, breakthrough research, etc.). Be conservative — not every article is breaking.
- **topic_scores**: Object mapping each topic ID to a relevance score 0.0–1.0. 0 = irrelevant, 0.5 = somewhat relevant, 1.0 = highly relevant. Only score the topics listed below.
- **cross_topic_ids**: If the article is significantly relevant to 2+ topics, list those topic IDs. Otherwise null.
- **cross_topic_reason**: If cross_topic_ids is not null, a short explanation (max 15 words) of why it spans multiple topics. Otherwise null.

Topics to score:
${topicList}

Article title: ${title}
Article content: ${content.slice(0, 1500)}

Respond with ONLY valid JSON matching this exact structure. No markdown, no explanation.`

  let text = ''
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    text = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (err) {
    logger.error('Claude API call failed', { title, error: String(err) })
    return EMPTY_ANALYSIS(title)
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
  articles: Array<{ title: string; content: string; candidateTopicIds: string[] }>
): Promise<ArticleAnalysis[]> {
  const CONCURRENCY = 5
  const results: ArticleAnalysis[] = []

  for (let i = 0; i < articles.length; i += CONCURRENCY) {
    const batch = articles.slice(i, i + CONCURRENCY)
    // Use allSettled so one failure doesn't drop the whole batch
    const settled = await Promise.allSettled(
      batch.map((a) => analyzeArticle(a.title, a.content, a.candidateTopicIds))
    )
    for (let j = 0; j < settled.length; j++) {
      const result = settled[j]
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        logger.error('analyzeArticle failed for article', {
          title: batch[j].title,
          error: String(result.reason),
        })
        results.push(EMPTY_ANALYSIS(batch[j].title))
      }
    }
  }

  return results
}
