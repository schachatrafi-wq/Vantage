/**
 * Twitter/X via official API v2 (Bearer Token — app-only auth).
 * Requires TWITTER_BEARER_TOKEN in .env.local
 *
 * Free tier: Basic access required ($100/month) for search.
 * If no token is set, all calls return [] gracefully.
 */

import { TwitterApi } from 'twitter-api-v2'
import type { FeedItem } from './rss'

function getClient(): TwitterApi | null {
  const token = process.env.TWITTER_BEARER_TOKEN
  if (!token) return null
  return new TwitterApi(token)
}

export async function searchTwitter(
  query: string,
  label: string,
  maxTweets = 15,
): Promise<FeedItem[]> {
  const client = getClient()
  if (!client) return []

  try {
    const response = await client.v2.search(
      `${query} -is:retweet -is:reply lang:en`,
      {
        max_results: Math.min(maxTweets, 100),
        'tweet.fields': ['created_at', 'author_id', 'text'],
        expansions: ['author_id'],
        'user.fields': ['username'],
      }
    )

    const users = new Map(
      (response.includes?.users ?? []).map((u) => [u.id, u.username])
    )

    return ((response.data as unknown as { id: string; text: string; author_id?: string; created_at?: string }[] | undefined) ?? []).map((tweet) => {
      const username = users.get(tweet.author_id ?? '') ?? 'twitter'
      return {
        title: tweet.text.slice(0, 280).replace(/\s+/g, ' ').trim(),
        url: `https://x.com/${username}/status/${tweet.id}`,
        source: `@${username} (${label})`,
        sourceDomain: 'x.com',
        publishedAt: tweet.created_at ? new Date(tweet.created_at) : null,
        content: tweet.text,
        imageUrl: null,
      }
    })
  } catch {
    return []
  }
}

export async function fetchAccountTweets(
  username: string,
  label: string,
  maxTweets = 5,
): Promise<FeedItem[]> {
  const client = getClient()
  if (!client) return []

  try {
    const user = await client.v2.userByUsername(username)
    if (!user.data?.id) return []

    const response = await client.v2.userTimeline(user.data.id, {
      max_results: Math.min(maxTweets, 100),
      'tweet.fields': ['created_at', 'text'],
      exclude: ['retweets', 'replies'],
    })

    return (response.data.data ?? []).map((tweet) => ({
      title: tweet.text.slice(0, 280).replace(/\s+/g, ' ').trim(),
      url: `https://x.com/${username}/status/${tweet.id}`,
      source: `@${username} (${label})`,
      sourceDomain: 'x.com',
      publishedAt: tweet.created_at ? new Date(tweet.created_at) : null,
      content: tweet.text,
      imageUrl: null,
    }))
  } catch {
    return []
  }
}
