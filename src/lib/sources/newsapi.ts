import type { FeedItem } from './rss'

const TOPIC_QUERIES: Record<string, string> = {
  // Original 12
  'ai-agi': 'artificial intelligence OR AGI OR "machine learning" OR "large language model" OR OpenAI OR Anthropic',
  'cybersecurity': 'cybersecurity OR "data breach" OR ransomware OR hacking OR "zero day"',
  'blockchain-crypto': 'cryptocurrency OR bitcoin OR ethereum OR blockchain OR DeFi OR "crypto market"',
  'ai-commercial-law': '"AI regulation" OR "AI law" OR "artificial intelligence law" OR "EU AI Act" OR "AI liability"',
  'gambling-gaming-law': 'gambling regulation OR "sports betting" OR "gaming license" OR "online gambling" OR casino regulation',
  'data-privacy': 'GDPR OR "data privacy" OR "data protection" OR "privacy law" OR surveillance',
  'stock-market': 'stock market OR "Wall Street" OR "S&P 500" OR earnings OR "Fed rate" OR "market rally"',
  'vc-startups': 'startup funding OR "venture capital" OR "Series A" OR unicorn OR IPO',
  'global-economy': '"global economy" OR inflation OR "interest rate" OR "trade war" OR recession OR "central bank"',
  'biotech-health': 'biotech OR "clinical trial" OR FDA OR "drug approval" OR "gene therapy" OR mRNA',
  'climate-energy': '"climate change" OR "renewable energy" OR "carbon emissions" OR "net zero" OR "solar power"',
  'space-defense': 'SpaceX OR NASA OR "space launch" OR "defense spending" OR "military technology"',
  // New 38
  'us-politics': 'Congress OR "White House" OR Senate OR "House of Representatives" OR "US politics" OR Biden OR Trump',
  'geopolitics': 'geopolitics OR "foreign policy" OR NATO OR "international relations" OR "United Nations" OR diplomacy',
  'entertainment': 'celebrity OR Grammy OR Oscar OR "box office" OR "music industry" OR "pop culture" OR Netflix',
  'classical-opera': 'opera OR "classical music" OR orchestra OR symphony OR conductor OR "Carnegie Hall" OR "Royal Opera"',
  'judaism': 'Israel OR Judaism OR "Jewish community" OR antisemitism OR synagogue OR Torah OR "Israeli politics"',
  'sports': 'NFL OR NBA OR Premier League OR Olympics OR tennis OR golf OR "World Cup" OR championship',
  'real-estate': '"real estate" OR "housing market" OR "property prices" OR REIT OR "commercial real estate" OR mortgage',
  'food-drink': 'restaurant OR "food industry" OR chef OR "wine industry" OR "food trends" OR "Michelin star"',
  'fashion-luxury': 'fashion OR "luxury brands" OR LVMH OR Gucci OR "fashion week" OR "luxury market"',
  'science': '"scientific research" OR "physics discovery" OR "chemistry research" OR "Nobel Prize" OR CERN OR "quantum computing"',
  'gaming-esports': '"video games" OR esports OR "game release" OR "gaming industry" OR PlayStation OR Xbox OR Nintendo',
  'consumer-tech': 'iPhone OR Android OR "consumer electronics" OR "tech gadgets" OR Apple OR Samsung OR "smart home"',
  'film-tv': '"box office" OR streaming OR "film festival" OR HBO OR "Netflix series" OR "movie release" OR Hollywood',
  'literature': '"book release" OR "literary prize" OR "best seller" OR publishing OR "book review" OR "Man Booker"',
  'art-design': '"art market" OR "gallery exhibition" OR "art auction" OR Sotheby OR "design award" OR "contemporary art"',
  'media-journalism': '"press freedom" OR "media company" OR journalism OR "newspaper industry" OR "digital media" OR newsroom',
  'mental-health': '"mental health" OR depression OR anxiety OR "therapy" OR "psychiatric" OR wellbeing OR "mental illness"',
  'travel': 'tourism OR "travel industry" OR "airline industry" OR "hotel industry" OR destination OR "travel trends"',
  'automotive-ev': '"electric vehicle" OR Tesla OR "EV market" OR "self-driving" OR "car industry" OR "autonomous vehicle"',
  'robotics': 'robotics OR "industrial automation" OR "humanoid robot" OR "Boston Dynamics" OR "manufacturing automation"',
  'nuclear': '"nuclear energy" OR "nuclear fusion" OR "nuclear power" OR "uranium" OR "nonproliferation" OR "IAEA"',
  'trade-tariffs': 'tariffs OR "trade war" OR "WTO" OR sanctions OR "trade deficit" OR "supply chain" OR "trade deal"',
  'elections': 'election OR "voter turnout" OR "campaign finance" OR "electoral reform" OR "voting rights" OR ballot',
  'military': '"military spending" OR "armed forces" OR "defense budget" OR veterans OR "military technology" OR Pentagon',
  'emerging-markets': '"emerging markets" OR "developing economies" OR BRICS OR "frontier markets" OR "African economy" OR "Southeast Asia economy"',
  'aviation': 'airline OR "aviation industry" OR airport OR Boeing OR Airbus OR "air travel" OR "flight" OR "aviation safety"',
  'agriculture': 'agriculture OR farming OR "food security" OR "crop yield" OR "agricultural technology" OR "food supply"',
  'human-rights': '"human rights" OR "civil liberties" OR Amnesty OR "Human Rights Watch" OR "UN rights" OR "freedom of speech"',
  'religion': 'religion OR "Catholic Church" OR Islam OR Buddhism OR Hindu OR "religious freedom" OR theology OR faith',
  'environment': 'biodiversity OR "wildlife conservation" OR deforestation OR ocean OR "species extinction" OR "ecosystem"',
  'health-wellness': '"public health" OR nutrition OR fitness OR "wellness industry" OR "preventive health" OR "healthy living"',
  'philosophy': 'philosophy OR ethics OR "moral philosophy" OR "political theory" OR "applied ethics" OR consciousness',
  'education': 'education OR "university rankings" OR "EdTech" OR "student loans" OR "school reform" OR "higher education"',
  'immigration': 'immigration OR "asylum seekers" OR "border policy" OR "migration" OR "refugee crisis" OR "visa policy"',
  'labor': '"labor market" OR unions OR "minimum wage" OR "workers rights" OR "remote work" OR "employment trends" OR strikes',
  'architecture': 'architecture OR "urban planning" OR "building design" OR "Pritzker Prize" OR "city development" OR urbanism',
  'social-media-tech': '"social media" OR "content moderation" OR Meta OR TikTok OR "platform policy" OR Twitter OR X',
  'pharma': 'pharmaceutical OR "drug approval" OR "FDA approval" OR "clinical trial" OR "drug pricing" OR "biotech drug"',
}

export type NewsApiArticle = {
  source: { id: string | null; name: string }
  title: string
  description: string | null
  url: string
  urlToImage: string | null
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
  url.searchParams.set('from', new Date(Date.now() - 24 * 3600 * 1000).toISOString())

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
      imageUrl: a.urlToImage ?? null,
    }))
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
