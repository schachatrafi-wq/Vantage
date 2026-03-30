import { schedules, logger } from '@trigger.dev/sdk/v3'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
    const currentUTCMinute = now.getUTCMinutes()

    // Get all push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth, timezone')

    if (!subscriptions || subscriptions.length === 0) return

    const digestsSent: string[] = []

    for (const sub of subscriptions) {
      const userLocalHour = getLocalHour(currentUTCHour, sub.timezone)

      const isMorning = userLocalHour === 9
      const isEvening = userLocalHour === 18

      if (!isMorning && !isEvening) continue

      const digestType = isMorning ? 'morning' : 'evening'

      // Check if digest already sent this period (debounce)
      const periodKey = `${sub.user_id}-${digestType}-${now.toISOString().slice(0, 13)}`
      const { data: existing } = await supabase
        .from('digest_sent_log')
        .select('id')
        .eq('period_key', periodKey)
        .single()

      if (existing) continue

      // Get user topics
      const { data: userTopics } = await supabase
        .from('user_topics')
        .select('topic_id')
        .eq('user_id', sub.user_id)

      const topicIds = (userTopics ?? []).map((t) => t.topic_id)
      if (topicIds.length === 0) continue

      // Get top articles from last 4-6 hours (morning) or 4-8 hours (evening)
      const lookbackHours = isEvening ? 8 : 5
      const since = new Date(Date.now() - lookbackHours * 3600 * 1000)

      const { data: articleTopics } = await supabase
        .from('article_topics')
        .select('article_id, topic_id, relevance_score')
        .in('topic_id', topicIds)
        .gte('relevance_score', 0.5)
        .order('relevance_score', { ascending: false })
        .limit(50)

      const articleIds = [...new Set((articleTopics ?? []).map((r) => r.article_id))]

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

      const digest = await generateDigest(articles, topicNames, digestType)

      await sendDigestPush(sub.endpoint, sub.p256dh, sub.auth, digest, digestType)

      await supabase.from('digest_sent_log').insert({ period_key: periodKey, user_id: sub.user_id })

      digestsSent.push(sub.user_id)
    }

    logger.info('Digests sent', { count: digestsSent.length })
    return { sent: digestsSent.length }
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
    model: 'claude-haiku-4-5-20251001',
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

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return

  const { default: webpush } = await import('web-push')
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const title = type === 'morning' ? '☀️ Morning Briefing — Vantage' : '🌙 Evening Digest — Vantage'

  await webpush.sendNotification(
    { endpoint, keys: { p256dh, auth } },
    JSON.stringify({ title, body, data: { type: 'digest' } })
  ).catch(() => {})
}

function getLocalHour(utcHour: number, timezone: string): number {
  try {
    const date = new Date()
    date.setUTCHours(utcHour, 0, 0, 0)
    const localTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(date)
    return parseInt(localTime, 10)
  } catch {
    return utcHour
  }
}
