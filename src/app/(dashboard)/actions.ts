'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

export async function rateArticle(articleId: string, rating: 1 | -1 | null) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

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

  await updateAffinityProfile(userId, articleId, rating)
}

export async function rateSource(sourceDomain: string, rating: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

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

  const weights: Record<string, number> = (profile?.topic_weights as Record<string, number>) ?? {}

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

  const supabase = createServerClient()

  await supabase.from('user_topics').delete().eq('user_id', userId)
  await supabase.from('user_topics').insert(
    topicIds.map((topicId, i) => ({
      user_id: userId,
      topic_id: topicId,
      priority_order: i,
    }))
  )
}
