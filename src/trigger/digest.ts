import { schedules, logger } from '@trigger.dev/sdk/v3'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

// Runs every hour, checks which users need their 9am or 6pm digest
export const digestSchedulerTask = schedules.task({
  id: 'digest-scheduler',
  cron: '0 * * * *',
  maxDuration: 300,
  run: async () => {
    logger.info('Digest scheduler running')
    const supabase = createServerClient()

    const now = new Date()
    const currentUTCHour = now.getUTCHours()

    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth, timezone')

    if (subError) {
      logger.error('Failed to fetch push subscriptions', { error: subError.message })
      return
    }
    if (!subscriptions || subscriptions.length === 0) return

    let digestsSent = 0

    for (const sub of subscriptions) {
      const userLocalHour = getLocalHour(currentUTCHour, sub.timezone as string)
      const isMorning = userLocalHour === 9
      const isEvening = userLocalHour === 18
      if (!isMorning && !isEvening) continue

      const digestType = isMorning ? 'morning' : 'evening'
      // period key is user + type + hour window (UTC hour rounded to relevant period)
      const periodKey = `${sub.user_id}-${digestType}-${now.toISOString().slice(0, 13)}`

      // Use upsert with conflict on period_key to prevent race conditions
      const { error: logError } = await supabase
        .from('digest_sent_log')
        .insert({ period_key: periodKey, user_id: sub.user_id })
        .select()

      // If insert failed due to unique constraint, digest already sent — skip
      if (logError) {
        if (logError.code !== '23505') {
          logger.error('digest_sent_log insert error', { error: logError.message, periodKey })
        }
        continue
      }

      const { data: userTopics } = await supabase
        .from('user_topics')
        .select('topic_id')
        .eq('user_id', sub.user_id)

      const topicIds = ((userTopics ?? []) as { topic_id: string }[]).map((t) => t.topic_id)
      if (topicIds.length === 0) continue

      const lookbackHours = isEvening ? 8 : 5
      const since = new Date(Date.now() - lookbackHours * 3600 * 1000)

      const { data: articleTopics } = await supabase
        .from('article_topics')
        .select('article_id, relevance_score')
        .in('topic_id', topicIds)
        .gte('relevance_score', 0.5)
        .order('relevance_score', { ascending: false })
        .limit(50)

      const articleIds = [...new Set(((articleTopics ?? []) as { article_id: string }[]).map((r) => r.article_id))]
      if (articleIds.length === 0) continue

      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, url, source_domain, article_summaries(one_liner)')
        .in('id', articleIds)
        .gte('published_at', since.toISOString())
        .order('published_at', { ascending: false })
        .limit(10)

      if (!articles || articles.length === 0) continue

      const topicNames = topicIds
        .map((id) => TOPICS.find((t) => t.id === id)?.name)
        .filter(Boolean)
        .join(', ')

      try {
        const digest = await generateDigest(
          articles as Array<{ title: string; url: string; source_domain: string; article_summaries: unknown }>,
          topicNames,
          digestType
        )
        await sendDigestPush(sub.endpoint as string, sub.p256dh as string, sub.auth as string, digest, digestType)
        digestsSent++
      } catch (err) {
        logger.error('Failed to send digest', { userId: sub.user_id, error: String(err) })
      }
    }

    logger.info('Digests sent', { count: digestsSent })
    return { sent: digestsSent }
  },
})

async function generateDigest(
  articles: Array<{ title: string; url: string; source_domain: string; article_summaries: unknown }>,
  topicNames: string,
  type: 'morning' | 'evening'
): Promise<string> {
  const articleList = articles
    .slice(0, 5)
    .map((a, i) => {
      const summaries = a.article_summaries as { one_liner?: string }[] | null
      const oneLiner = Array.isArray(summaries) && summaries[0]?.one_liner
      return `${i + 1}. ${a.title}${oneLiner ? ` — ${oneLiner}` : ''}`
    })
    .join('\n')

  const prompt = `You are Vantage, an intelligent news assistant. Write a brief ${type === 'morning' ? 'morning' : 'evening'} digest notification (max 120 characters) summarizing the most important stories for someone following: ${topicNames}.

Top stories:
${articleList}

Write only the notification body text. Be direct and informative. Start with the single most important theme or story.`

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 80,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text'
    ? message.content[0].text.trim().slice(0, 120)
    : `${articles.length} new stories across your topics`
}

async function sendDigestPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  body: string,
  type: 'morning' | 'evening'
): Promise<void> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    logger.warn('VAPID keys not configured, skipping digest push')
    return
  }

  const { default: webpush } = await import('web-push')
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const title = type === 'morning' ? '☀️ Morning Briefing — Vantage' : '🌙 Evening Digest — Vantage'

  try {
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify({ title, body, data: { type: 'digest' } })
    )
  } catch (err) {
    logger.error('sendDigestPush failed', { endpoint: endpoint.slice(0, 40), error: String(err) })
  }
}

function getLocalHour(utcHour: number, timezone: string): number {
  try {
    const date = new Date()
    date.setUTCHours(utcHour, 0, 0, 0)
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(date)
    const parsed = parseInt(formatted, 10)
    // Intl can return 24 for midnight in some locales; normalise
    return isNaN(parsed) ? utcHour : parsed % 24
  } catch {
    // Invalid timezone string — fall back to UTC
    logger.warn('Invalid timezone in push subscription', { timezone })
    return utcHour
  }
}
