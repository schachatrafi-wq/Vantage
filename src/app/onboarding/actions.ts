'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { MAX_USER_TOPICS } from '@/lib/topics'

export async function saveUserTopics(topicIds: string[]) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  if (topicIds.length === 0 || topicIds.length > MAX_USER_TOPICS) {
    throw new Error(`Select between 1 and ${MAX_USER_TOPICS} topics`)
  }

  const supabase = createServerClient()

  await supabase.from('user_topics').delete().eq('user_id', userId)

  await supabase.from('user_topics').insert(
    topicIds.map((topicId, i) => ({
      user_id: userId,
      topic_id: topicId,
      priority_order: i,
    }))
  )

  await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId)

  await supabase
    .from('user_affinity_profiles')
    .upsert({ user_id: userId, keywords: {}, topic_weights: {} })
}
