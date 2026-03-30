import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/topics'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()
  const { data: userTopicRows } = await supabase
    .from('user_topics')
    .select('topic_id, priority_order')
    .eq('user_id', userId)
    .order('priority_order')

  const userTopics = (userTopicRows ?? [])
    .map((row) => TOPICS.find((t) => t.id === row.topic_id))
    .filter(Boolean) as (typeof TOPICS)[number][]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userTopics={userTopics} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
