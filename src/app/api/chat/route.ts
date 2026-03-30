import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await request.json()
  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Get user's topic IDs
  const { data: userTopicRows } = await supabase
    .from('user_topics')
    .select('topic_id')
    .eq('user_id', userId)

  const topicIds = (userTopicRows ?? []).map((r) => r.topic_id)

  // Fetch recent relevant articles with summaries
  const { data: articleTopicRows } = await supabase
    .from('article_topics')
    .select('article_id, topic_id, relevance_score')
    .in('topic_id', topicIds.length > 0 ? topicIds : ['ai-agi'])
    .gte('relevance_score', 0.4)
    .order('relevance_score', { ascending: false })
    .limit(100)

  const articleIds = [...new Set((articleTopicRows ?? []).map((r) => r.article_id))].slice(0, 40)

  const [{ data: articles }, { data: summaries }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, url, source_domain, published_at')
      .in('id', articleIds)
      .order('published_at', { ascending: false }),
    supabase.from('article_summaries').select('article_id, bullets, one_liner').in('article_id', articleIds),
  ])

  const summaryMap = Object.fromEntries((summaries ?? []).map((s) => [s.article_id, s]))

  // Build context from articles
  const contextLines = (articles ?? [])
    .map((a) => {
      const summary = summaryMap[a.id]
      const bullets = summary?.bullets?.join(' ') ?? summary?.one_liner ?? ''
      return `[${a.source_domain}] "${a.title}" — ${bullets} (${a.url})`
    })
    .join('\n')

  const systemPrompt = `You are a knowledgeable news analyst for Vantage, a personalized news platform.
You have access to recent news articles that have been curated and summarized.
Answer the user's question based on the provided articles when relevant, or from your general knowledge when no articles apply.
Always cite your sources by mentioning the publication name.
Be concise, accurate, and insightful. Format your response in clear paragraphs.

Recent articles context:
${contextLines || 'No recent articles available.'}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: question }],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate a response.'

  // Collect source articles actually mentioned or referenced
  const sourcedArticles = (articles ?? []).slice(0, 5).map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source_domain,
  }))

  return NextResponse.json({ answer: responseText, sources: sourcedArticles })
}
