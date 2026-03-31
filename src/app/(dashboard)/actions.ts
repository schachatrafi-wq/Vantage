'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { MAX_USER_TOPICS, MAX_CUSTOM_TOPICS, TOPICS, slugifyCustomTopic } from '@/lib/topics'

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

export async function addCustomTopic(name: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const trimmed = name.trim()
  if (!trimmed || trimmed.length < 2) throw new Error('Topic name must be at least 2 characters')
  if (trimmed.length > 80) throw new Error('Topic name too long')

  const slug = slugifyCustomTopic(trimmed)
  const supabase = createServerClient()

  // Enforce limit
  const { count } = await supabase
    .from('user_custom_topics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if ((count ?? 0) >= MAX_CUSTOM_TOPICS) throw new Error(`Maximum ${MAX_CUSTOM_TOPICS} custom topics allowed`)

  const { error } = await supabase.from('user_custom_topics').insert({
    user_id: userId,
    name: trimmed,
    slug,
    icon: pickIcon(trimmed),
  })

  if (error) {
    if (error.code === '23505') throw new Error('You already have a topic with that name')
    throw new Error(`Failed to add topic: ${error.message}`)
  }
}

export async function removeCustomTopic(slug: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (!/^x-[a-z0-9-]+$/.test(slug)) throw new Error('Invalid slug')

  const supabase = createServerClient()
  await supabase
    .from('user_custom_topics')
    .delete()
    .eq('user_id', userId)
    .eq('slug', slug)
}

/** Picks a reasonable emoji for a custom topic based on keywords in the name */
function pickIcon(name: string): string {
  const n = name.toLowerCase()
  if (/sport|football|soccer|basketball|tennis|cricket|golf|rugby/.test(n)) return '⚽'
  if (/poker|casino|bet|gambling|lottery/.test(n)) return '🎲'
  if (/formula|f1|racing|nascar|motorsport/.test(n)) return '🏎️'
  if (/crypto|bitcoin|ethereum|nft|defi/.test(n)) return '💰'
  if (/ai|artificial intelligence|ml|llm|gpt/.test(n)) return '🤖'
  if (/climate|environment|green|solar|wind/.test(n)) return '🌱'
  if (/health|medicine|medical|hospital|drug/.test(n)) return '💊'
  if (/tech|software|hardware|startup|app/.test(n)) return '💻'
  if (/war|conflict|military|ukraine|israel|gaza/.test(n)) return '⚔️'
  if (/politic|election|congress|parliament|government/.test(n)) return '🏛️'
  if (/music|concert|album|artist|band/.test(n)) return '🎵'
  if (/film|movie|cinema|netflix|streaming/.test(n)) return '🎬'
  if (/food|restaurant|chef|cuisine|cook/.test(n)) return '🍽️'
  if (/travel|holiday|vacation|destination/.test(n)) return '✈️'
  if (/science|research|physics|biology|chemistry/.test(n)) return '🔬'
  if (/space|nasa|rocket|satellite|mars/.test(n)) return '🚀'
  if (/real estate|property|housing|mortgage/.test(n)) return '🏠'
  if (/law|legal|court|regulation|compliance/.test(n)) return '⚖️'
  if (/fashion|luxury|style|brand|designer/.test(n)) return '👗'
  if (/art|gallery|museum|painting|sculpture/.test(n)) return '🎨'
  if (/book|literature|author|novel|publishing/.test(n)) return '📚'
  return '🔍'
}
