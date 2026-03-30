export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Article = {
  id: string
  title: string
  url: string
  source_domain: string
  published_at: string | null
  raw_content: string | null
  created_at: string
}

export type ArticleSummary = {
  id: string
  article_id: string
  bullets: string[]
  one_liner: string | null
  is_breaking: boolean
  created_at: string
}

export type ArticleTopic = {
  article_id: string
  topic_id: string
  relevance_score: number
}

export type CrossTopicFlag = {
  id: string
  article_id: string
  topic_ids: string[]
  reason: string
  created_at: string
}

export type UserTopic = {
  user_id: string
  topic_id: string
  priority_order: number
}

export type UserSourceRating = {
  user_id: string
  source_domain: string
  rating: number
  updated_at: string
}

export type UserArticleRating = {
  user_id: string
  article_id: string
  rating: 1 | -1
  created_at: string
}

export type UserAffinityProfile = {
  user_id: string
  keywords: Record<string, number>
  topic_weights: Record<string, number>
  updated_at: string
}

export type PushSubscription = {
  id: string
  user_id: string
  endpoint: string
  keys: { p256dh: string; auth: string }
  timezone: string
  created_at: string
}

export type DbUser = {
  id: string
  email: string
  name: string | null
  onboarding_completed: boolean
  created_at: string
}

export type ArticleWithSummary = Article & {
  summary: ArticleSummary | null
  topics: string[]
  cross_topic_flag: CrossTopicFlag | null
  user_rating: 1 | -1 | null
  source_rating: number | null
  relevance_score: number
}
