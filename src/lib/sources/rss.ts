import Parser from 'rss-parser'
import { NITTER_INSTANCES } from './accounts'

export type FeedItem = {
  title: string
  url: string
  source: string
  sourceDomain: string
  publishedAt: Date | null
  content: string
  imageUrl: string | null
}

type CustomItem = {
  'media:content'?: { $?: { url?: string } }
  'media:thumbnail'?: { $?: { url?: string } }
  enclosure?: { url?: string; type?: string }
}

const parser = new Parser<object, CustomItem>({
  timeout: 5000,
  headers: { 'User-Agent': 'Vantage-NewsBot/1.0 (news aggregator)' },
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: false }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
      'enclosure',
    ],
  },
})

export async function fetchRssFeed(
  url: string,
  label: string,
  maxItems = 20
): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(url)
    const domain = extractDomain(url)

    return (feed.items ?? [])
      .slice(0, maxItems)
      .filter((item) => item.title && (item.link ?? item.guid))
      .map((item) => ({
        title: item.title!.trim(),
        url: (item.link ?? item.guid)!,
        source: label,
        sourceDomain: domain,
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        content: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? '').slice(0, 2000),
        imageUrl: extractImage(item),
      }))
  } catch {
    return []
  }
}

export async function fetchNitterFeed(
  username: string,
  label: string,
  maxItems = 10
): Promise<FeedItem[]> {
  for (const instance of NITTER_INSTANCES) {
    const url = `https://${instance}/${username}/rss`
    try {
      const feed = await parser.parseURL(url)
      return (feed.items ?? [])
        .slice(0, maxItems)
        .filter((item) => item.title && item.link)
        .map((item) => ({
          title: item.title!.trim(),
          url: normalizeNitterUrl(item.link!, username),
          source: `@${username} (${label})`,
          sourceDomain: 'x.com',
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          content: stripHtml(item.contentSnippet ?? item.content ?? '').slice(0, 1000),
          imageUrl: extractImage(item),
        }))
    } catch {
      continue
    }
  }
  return []
}

function extractImage(item: CustomItem & { itunes?: { image?: string } }): string | null {
  try {
    const enc = item.enclosure
    if (enc?.url && enc?.type?.startsWith('image/')) return enc.url
    const mc = item['media:content']
    if (mc?.$?.url) return mc.$.url
    const mt = item['media:thumbnail']
    if (mt?.$?.url) return mt.$.url
  } catch {
    // ignore
  }
  return null
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeNitterUrl(nitterUrl: string, username: string): string {
  try {
    const u = new URL(nitterUrl)
    return `https://x.com${u.pathname}`
  } catch {
    return `https://x.com/${username}`
  }
}
