export type RssFeed = {
  url: string
  label: string
  topicIds: string[]
}

export const RSS_FEEDS: RssFeed[] = [
  // AI & AGI
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', label: 'TechCrunch AI', topicIds: ['ai-agi', 'vc-startups'] },
  { url: 'https://www.technologyreview.com/feed/', label: 'MIT Tech Review', topicIds: ['ai-agi', 'biotech-health'] },
  { url: 'https://venturebeat.com/category/ai/feed/', label: 'VentureBeat AI', topicIds: ['ai-agi', 'vc-startups'] },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', label: 'The Verge AI', topicIds: ['ai-agi'] },
  { url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', label: 'Wired AI', topicIds: ['ai-agi'] },
  { url: 'https://deepmind.google/blog/rss.xml', label: 'Google DeepMind Blog', topicIds: ['ai-agi'] },

  // Cybersecurity
  { url: 'https://feeds.feedburner.com/TheHackersNews', label: 'The Hacker News', topicIds: ['cybersecurity'] },
  { url: 'https://krebsonsecurity.com/feed/', label: 'Krebs on Security', topicIds: ['cybersecurity'] },
  { url: 'https://www.darkreading.com/rss.xml', label: 'Dark Reading', topicIds: ['cybersecurity'] },
  { url: 'https://www.bleepingcomputer.com/feed/', label: 'Bleeping Computer', topicIds: ['cybersecurity'] },
  { url: 'https://www.schneier.com/blog/atom.xml', label: 'Schneier on Security', topicIds: ['cybersecurity', 'data-privacy'] },

  // Blockchain & Crypto
  { url: 'https://coindesk.com/arc/outboundfeeds/rss/', label: 'CoinDesk', topicIds: ['blockchain-crypto'] },
  { url: 'https://cointelegraph.com/rss', label: 'CoinTelegraph', topicIds: ['blockchain-crypto'] },
  { url: 'https://decrypt.co/feed', label: 'Decrypt', topicIds: ['blockchain-crypto'] },
  { url: 'https://thedefiant.io/api/feeds/rss.xml', label: 'The Defiant', topicIds: ['blockchain-crypto'] },

  // AI & Commercial Law
  { url: 'https://www.lawfaremedia.org/articles/feed', label: 'Lawfare', topicIds: ['ai-commercial-law', 'data-privacy'] },
  { url: 'https://feeds.lexology.com/lexology', label: 'Lexology', topicIds: ['ai-commercial-law', 'gambling-gaming-law'] },
  { url: 'https://iapp.org/news/rss/', label: 'IAPP', topicIds: ['ai-commercial-law', 'data-privacy'] },
  { url: 'https://www.technologylawblog.com/feed/', label: 'Tech Law Blog', topicIds: ['ai-commercial-law'] },

  // Gambling & Gaming Law
  { url: 'https://www.igamingbusiness.com/rss.xml', label: 'iGaming Business', topicIds: ['gambling-gaming-law'] },
  { url: 'https://calvinayre.com/feed/', label: 'Calvin Ayre', topicIds: ['gambling-gaming-law'] },
  { url: 'https://sbcnews.co.uk/feed/', label: 'SBC News', topicIds: ['gambling-gaming-law'] },
  { url: 'https://www.gamblinginsider.com/feed/', label: 'Gambling Insider', topicIds: ['gambling-gaming-law'] },
  { url: 'https://www.sportsbusinessjournal.com/SB/Sections/Technology/RSS-Feed.aspx', label: 'Sports Business Journal', topicIds: ['gambling-gaming-law'] },

  // Data Privacy
  { url: 'https://www.eff.org/rss/updates.xml', label: 'EFF', topicIds: ['data-privacy', 'ai-commercial-law'] },
  { url: 'https://privacyinternational.org/feed', label: 'Privacy International', topicIds: ['data-privacy'] },
  { url: 'https://edps.europa.eu/press-publications/press-news/press-releases/feed_en', label: 'EDPS', topicIds: ['data-privacy', 'ai-commercial-law'] },

  // Stock Market
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines', label: 'MarketWatch Real-time', topicIds: ['stock-market'] },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', label: 'MarketWatch Top', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', label: 'WSJ Markets', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://www.investing.com/rss/news.rss', label: 'Investing.com', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://seekingalpha.com/market_currents.xml', label: 'Seeking Alpha', topicIds: ['stock-market'] },

  // VC & Startups
  { url: 'https://techcrunch.com/startups/feed/', label: 'TechCrunch Startups', topicIds: ['vc-startups'] },
  { url: 'https://news.crunchbase.com/feed/', label: 'Crunchbase News', topicIds: ['vc-startups'] },
  { url: 'https://techcrunch.com/venture/feed/', label: 'TechCrunch Venture', topicIds: ['vc-startups'] },

  // Global Economy
  { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters Business', topicIds: ['global-economy', 'stock-market'] },
  { url: 'https://www.ft.com/rss/home', label: 'Financial Times', topicIds: ['global-economy', 'stock-market'] },
  { url: 'https://www.economist.com/latest/rss.xml', label: 'The Economist', topicIds: ['global-economy'] },
  { url: 'https://www.imf.org/en/News/rss?language=eng', label: 'IMF News', topicIds: ['global-economy'] },

  // Biotech & Health Tech
  { url: 'https://www.statnews.com/feed/', label: 'STAT News', topicIds: ['biotech-health'] },
  { url: 'https://www.fiercepharma.com/rss/xml', label: 'Fierce Pharma', topicIds: ['biotech-health'] },
  { url: 'https://endpts.com/feed/', label: 'Endpoints News', topicIds: ['biotech-health'] },
  { url: 'https://www.biopharmadive.com/feeds/news/', label: 'BioPharma Dive', topicIds: ['biotech-health'] },

  // Climate & Energy
  { url: 'https://www.carbonbrief.org/feed', label: 'Carbon Brief', topicIds: ['climate-energy'] },
  { url: 'https://www.iea.org/news.xml', label: 'IEA', topicIds: ['climate-energy'] },
  { url: 'https://www.renewableenergyworld.com/feed/', label: 'Renewable Energy World', topicIds: ['climate-energy'] },
  { url: 'https://electrek.co/feed/', label: 'Electrek', topicIds: ['climate-energy'] },

  // Space & Defense
  { url: 'https://spacenews.com/feed/', label: 'Space News', topicIds: ['space-defense'] },
  { url: 'https://www.defenseone.com/rss/all/', label: 'Defense One', topicIds: ['space-defense'] },
  { url: 'https://www.nasaspaceflight.com/feed/', label: 'NASASpaceFlight', topicIds: ['space-defense'] },
  { url: 'https://aviationweek.com/rss.xml', label: 'Aviation Week', topicIds: ['space-defense'] },
]
