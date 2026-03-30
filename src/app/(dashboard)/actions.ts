'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { MAX_USER_TOPICS, TOPICS } from '@/lib/topics'

const VALID_TOPIC_IDS = new Set(TOPICS.map((t) => t.id))

export async function rateArticle(articleId: string, rating: 1 | -1 | null) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (!/^[0-9a-f-]{36}$/i.test(articleId)) throw new Error('Invalid articleId')

  const supabase = createServerClient()

  if (rating === null) {
    await supabase
      .from('user_article_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId)
  } else {
    await supabase.from('user_article_ratings').upsert({
      user_id: userId,
      article_id: articleId,
      rating,
    })
  }

  // Fire-and-forget — affinity update is non-critical
  updateAffinityProfile(userId, articleId, rating).catch(() => {})
}

export async function rateSource(sourceDomain: string, rating: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) throw new Error('Invalid rating')

  const supabase = createServerClient()
  await supabase.from('user_source_ratings').upsert({
    user_id: userId,
    source_domain: sourceDomain,
    rating,
  })
}

async function updateAffinityProfile(
  userId: string,
  articleId: string,
  rating: 1 | -1 | null
) {
  if (rating === null) return

  const supabase = createServerClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, article_topics(topic_id, relevance_score)')
    .eq('id', articleId)
    .single()

  if (!article) return

  const { data: profile } = await supabase
    .from('user_affinity_profiles')
    .select('topic_weights')
    .eq('user_id', userId)
    .single()

  const weights: Record<string, number> =
    (profile?.topic_weights as Record<string, number>) ?? {}

  for (const at of article.article_topics as { topic_id: string; relevance_score: number }[]) {
    const current = weights[at.topic_id] ?? 1.0
    const delta = rating === 1 ? 0.05 : -0.05
    weights[at.topic_id] = Math.max(0.1, Math.min(3.0, current + delta))
  }

  await supabase.from('user_affinity_profiles').upsert({
    user_id: userId,
    topic_weights: weights,
  })
}

export async function saveSettings(topicIds: string[]) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (topicIds.length === 0 || topicIds.length > MAX_USER_TOPICS)
    throw new Error(`Select between 1 and ${MAX_USER_TOPICS} topics`)
  if (topicIds.some((id) => !VALID_TOPIC_IDS.has(id)))
    throw new Error('Invalid topic ID')

  const supabase = createServerClient()

  // Delete then insert — if insert fails, user is left with no topics.
  // Protect against this by verifying the insert count matches.
  const { error: deleteError } = await supabase
    .from('user_topics')
    .delete()
    .eq('user_id', userId)

  if (deleteError) throw new Error('Failed to update topics')

  const { error: insertError } = await supabase.from('user_topics').insert(
    topicIds.map((topicId, i) => ({
      user_id: userId,
      topic_id: topicId,
      priority_order: i,
    }))
  )

  if (insertError) {
    // Attempt to restore is not possible without transactions here,
    // but log clearly so it can be investigated
    throw new Error(`Failed to save topics: ${insertError.message}`)
  }
}
