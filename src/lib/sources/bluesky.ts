/**
 * Bluesky public search — no API key required.
 * Uses the public AppView API: https://public.api.bsky.app
 */

import type { FeedItem } from './rss'

const BLUESKY_SEARCH_URL = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts'

export async function searchBluesky(
  query: string,
  label: string,
  limit = 15,
): Promise<FeedItem[]> {
  try {
    const url = new URL(BLUESKY_SEARCH_URL)
    url.searchParams.set('q', query)
    url.searchParams.set('limit', String(Math.min(limit, 25)))
    url.searchParams.set('sort', 'latest')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return []

    const data = await res.json() as {
      posts?: Array<{
        uri: string
        author: { handle: string; displayName?: string }
        record: { text?: string; createdAt?: string }
        indexedAt?: string
        likeCount?: number
        repostCount?: number
      }>
    }

    return (data.posts ?? [])
      .filter((post) => {
        const text = post.record?.text ?? ''
        return text.length > 30
      })
      .map((post) => {
        const handle = post.author?.handle ?? 'bsky.social'
        const postId = post.uri?.split('/').pop() ?? ''
        const text = (post.record?.text ?? '').replace(/\s+/g, ' ').trim()
        return {
          title: text.slice(0, 280),
          url: `https://bsky.app/profile/${handle}/post/${postId}`,
          source: `@${handle} (${label})`,
          sourceDomain: 'bsky.app',
          publishedAt: post.record?.createdAt
            ? new Date(post.record.createdAt)
            : post.indexedAt
              ? new Date(post.indexedAt)
              : null,
          content: text,
          imageUrl: null,
        }
      })
  } catch {
    return []
  }
}
