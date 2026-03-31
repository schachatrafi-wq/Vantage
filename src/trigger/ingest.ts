import { schedules, task, logger } from '@trigger.dev/sdk/v3'
import { createServerClient } from '@/lib/supabase/server'
import { runIngestion } from '@/lib/ingestion/run'

// Runs every 30 minutes
export const ingestNewsTask = schedules.task({
  id: 'ingest-news',
  cron: '*/30 * * * *',
  maxDuration: 300,
  run: async () => {
    logger.info('Starting news ingestion')
    const supabase = createServerClient()

    // Housekeeping: prune old digest logs
    await supabase
      .from('digest_sent_log')
      .delete()
      .lt('created_at', new Date(Date.now() - 48 * 3600 * 1000).toISOString())

    const result = await runIngestion(supabase)
    logger.info('Ingestion complete', { ingested: result.ingested, breaking: result.breaking })

    if (result.breakingArticleIds.length > 0) {
      await sendBreakingNotificationsTask.trigger({ articleIds: result.breakingArticleIds })
    }

    return { ingested: result.ingested, breaking: result.breaking }
  },
})

// ── Breaking news push notifications ─────────────────────────────────────────
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

      const { data: subscribers } = await supabase
        .from('user_topics')
        .select('user_id')
        .in('topic_id', topicIds)

      if (!subscribers || subscribers.length === 0) continue

      const userIds = [...new Set(subscribers.map((s) => s.user_id))]

      const { data: pushSubs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .in('user_id', userIds)

      if (!pushSubs || pushSubs.length === 0) continue

      const payload = JSON.stringify({
        title: '🔴 Breaking News — Vantage',
        body: article.title.slice(0, 100),
        data: { articleId: article.id },
      })

      await Promise.allSettled(
        pushSubs.map((sub) =>
          sendWebPush(sub.endpoint as string, sub.p256dh as string, sub.auth as string, payload)
        )
      )
    }
  },
})

async function sendWebPush(endpoint: string, p256dh: string, auth: string, payload: string) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return

  const { default: webpush } = await import('web-push')
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload)
}
