import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import type { Topic } from '@/lib/topics'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const [{ data: userTopicRows }, { data: customTopicRows }] = await Promise.all([
    supabase
      .from('user_topics')
      .select('topic_id, priority_order')
      .eq('user_id', userId)
      .order('priority_order'),
    supabase
      .from('user_custom_topics')
      .select('name, slug, icon')
      .eq('user_id', userId)
      .order('created_at'),
  ])

  const regularTopics = (userTopicRows ?? [])
    .map((row) => TOPICS.find((t) => t.id === row.topic_id))
    .filter(Boolean) as Topic[]

  const customTopics: Topic[] = (customTopicRows ?? []).map((row) => ({
    id: row.slug,
    name: row.name,
    slug: row.slug,
    description: '',
    icon: row.icon,
  }))

  const allTopics = [...regularTopics, ...customTopics]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'transparent' }}>
      <Sidebar userTopics={allTopics} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
