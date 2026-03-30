import type { FeedItem } from './rss'

const TOPIC_QUERIES: Record<string, string> = {
  'ai-agi': 'artificial intelligence OR AGI OR "machine learning" OR "large language model" OR OpenAI OR Anthropic',
  cybersecurity: 'cybersecurity OR "data breach" OR ransomware OR hacking OR "zero day"',
  'blockchain-crypto': 'cryptocurrency OR bitcoin OR ethereum OR blockchain OR DeFi OR "crypto market"',
  'ai-commercial-law': '"AI regulation" OR "AI law" OR "artificial intelligence law" OR "EU AI Act" OR "AI liability"',
  'gambling-gaming-law': 'gambling regulation OR "sports betting" OR "gaming license" OR "online gambling" OR casino regulation',
  'data-privacy': 'GDPR OR "data privacy" OR "data protection" OR "privacy law" OR "surveillance"',
  'stock-market': 'stock market OR "Wall Street" OR "S&P 500" OR earnings OR "Fed rate" OR "market rally"',
  'vc-startups': 'startup funding OR "venture capital" OR "Series A" OR unicorn OR "IPO"',
  'global-economy': '"global economy" OR inflation OR "interest rate" OR "trade war" OR recession OR "central bank"',
  'biotech-health': 'biotech OR "clinical trial" OR FDA OR "drug approval" OR "gene therapy" OR mRNA',
  'climate-energy': '"climate change" OR "renewable energy" OR "carbon emissions" OR "net zero" OR "solar power"',
  'space-defense': 'SpaceX OR NASA OR "space launch" OR "defense spending" OR "military technology"',
}

export type NewsApiArticle = {
  source: { id: string | null; name: string }
  title: string
  description: string | null
  url: string
  publishedAt: string
  content: string | null
}

export async function fetchNewsApiForTopic(
  topicId: string,
  apiKey: string,
  maxItems = 20
): Promise<FeedItem[]> {
  const query = TOPIC_QUERIES[topicId]
  if (!query) return []

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', query)
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', String(maxItems))
  url.searchParams.set('language', 'en')
  url.searchParams.set('from', new Date(Date.now() - 4 * 3600 * 1000).toISOString())

  const res = await fetch(url.toString(), {
    headers: { 'X-Api-Key': apiKey },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    console.error(`NewsAPI error for topic ${topicId}: ${res.status} ${res.statusText}`)
    return []
  }

  const data = (await res.json()) as { articles: NewsApiArticle[] }

  return (data.articles ?? [])
    .filter((a) => a.title && a.url && !a.title.includes('[Removed]'))
    .map((a) => ({
      title: a.title.trim(),
      url: a.url,
      source: a.source.name ?? 'NewsAPI',
      sourceDomain: extractDomain(a.url),
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
      content: [a.description, a.content].filter(Boolean).join(' ').slice(0, 2000),
    }))
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
