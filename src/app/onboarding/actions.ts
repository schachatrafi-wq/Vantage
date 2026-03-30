'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { MAX_USER_TOPICS, TOPICS } from '@/lib/topics'

const VALID_TOPIC_IDS = new Set(TOPICS.map((t) => t.id))

export async function saveUserTopics(topicIds: string[]) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  if (topicIds.length === 0 || topicIds.length > MAX_USER_TOPICS) {
    throw new Error(`Select between 1 and ${MAX_USER_TOPICS} topics`)
  }
  if (topicIds.some((id) => !VALID_TOPIC_IDS.has(id))) {
    throw new Error('Invalid topic ID')
  }

  const supabase = createServerClient()

  const { error: deleteError } = await supabase
    .from('user_topics')
    .delete()
    .eq('user_id', userId)

  if (deleteError) throw new Error('Failed to clear existing topics')

  const { error: insertError } = await supabase.from('user_topics').insert(
    topicIds.map((topicId, i) => ({
      user_id: userId,
      topic_id: topicId,
      priority_order: i,
    }))
  )

  if (insertError) throw new Error(`Failed to save topics: ${insertError.message}`)

  const { error: userError } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId)

  if (userError) throw new Error('Failed to complete onboarding')

  // Non-critical — don't throw if this fails
  await supabase
    .from('user_affinity_profiles')
    .upsert({ user_id: userId, keywords: {}, topic_weights: {} })
}
