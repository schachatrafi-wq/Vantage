export type RssFeed = {
  url: string
  label: string
  topicIds: string[]
}

export const RSS_FEEDS: RssFeed[] = [
  // ── AI & AGI ──────────────────────────────────────────────────────────────
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', label: 'TechCrunch AI', topicIds: ['ai-agi', 'vc-startups'] },
  { url: 'https://www.technologyreview.com/feed/', label: 'MIT Tech Review', topicIds: ['ai-agi', 'science'] },
  { url: 'https://venturebeat.com/category/ai/feed/', label: 'VentureBeat AI', topicIds: ['ai-agi', 'vc-startups'] },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', label: 'The Verge AI', topicIds: ['ai-agi', 'consumer-tech'] },
  { url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', label: 'Wired AI', topicIds: ['ai-agi'] },
  { url: 'https://deepmind.google/blog/rss.xml', label: 'Google DeepMind', topicIds: ['ai-agi'] },

  // ── Cybersecurity ─────────────────────────────────────────────────────────
  { url: 'https://feeds.feedburner.com/TheHackersNews', label: 'The Hacker News', topicIds: ['cybersecurity'] },
  { url: 'https://krebsonsecurity.com/feed/', label: 'Krebs on Security', topicIds: ['cybersecurity'] },
  { url: 'https://www.darkreading.com/rss.xml', label: 'Dark Reading', topicIds: ['cybersecurity'] },
  { url: 'https://www.bleepingcomputer.com/feed/', label: 'Bleeping Computer', topicIds: ['cybersecurity'] },
  { url: 'https://www.schneier.com/blog/atom.xml', label: 'Schneier on Security', topicIds: ['cybersecurity', 'data-privacy'] },

  // ── Blockchain & Crypto ───────────────────────────────────────────────────
  { url: 'https://coindesk.com/arc/outboundfeeds/rss/', label: 'CoinDesk', topicIds: ['blockchain-crypto'] },
  { url: 'https://cointelegraph.com/rss', label: 'CoinTelegraph', topicIds: ['blockchain-crypto'] },
  { url: 'https://decrypt.co/feed', label: 'Decrypt', topicIds: ['blockchain-crypto'] },
  { url: 'https://thedefiant.io/api/feeds/rss.xml', label: 'The Defiant', topicIds: ['blockchain-crypto'] },

  // ── Consumer Tech ─────────────────────────────────────────────────────────
  { url: 'https://www.theverge.com/rss/index.xml', label: 'The Verge', topicIds: ['consumer-tech', 'social-media-tech'] },
  { url: 'https://www.engadget.com/rss.xml', label: 'Engadget', topicIds: ['consumer-tech', 'automotive-ev'] },
  { url: 'https://www.cnet.com/rss/news/', label: 'CNET', topicIds: ['consumer-tech'] },
  { url: 'https://arstechnica.com/feed/', label: 'Ars Technica', topicIds: ['consumer-tech', 'science'] },

  // ── Robotics ──────────────────────────────────────────────────────────────
  { url: 'https://spectrum.ieee.org/feeds/feed.rss', label: 'IEEE Spectrum', topicIds: ['robotics', 'ai-agi', 'science'] },
  { url: 'https://www.therobotreport.com/feed/', label: 'The Robot Report', topicIds: ['robotics'] },
  { url: 'https://roboticsandautomationnews.com/feed/', label: 'Robotics & Automation News', topicIds: ['robotics'] },

  // ── Social Media & Big Tech ───────────────────────────────────────────────
  { url: 'https://techcrunch.com/social/feed/', label: 'TechCrunch Social', topicIds: ['social-media-tech'] },
  { url: 'https://www.socialmediatoday.com/rss.xml', label: 'Social Media Today', topicIds: ['social-media-tech'] },
  { url: 'https://www.platformer.news/feed', label: 'Platformer', topicIds: ['social-media-tech', 'ai-agi'] },

  // ── AI & Commercial Law ───────────────────────────────────────────────────
  { url: 'https://www.lawfaremedia.org/articles/feed', label: 'Lawfare', topicIds: ['ai-commercial-law', 'data-privacy', 'geopolitics'] },
  { url: 'https://www.natlawreview.com/recent-articles/feed', label: 'National Law Review', topicIds: ['ai-commercial-law', 'gambling-gaming-law', 'data-privacy', 'labor'] },
  { url: 'https://fpf.org/feed/', label: 'Future of Privacy Forum', topicIds: ['ai-commercial-law', 'data-privacy'] },
  { url: 'https://www.eff.org/rss/updates.xml', label: 'EFF', topicIds: ['data-privacy', 'ai-commercial-law', 'human-rights'] },

  // ── Gambling & Gaming Law ─────────────────────────────────────────────────
  { url: 'https://www.igamingbusiness.com/feed', label: 'iGaming Business', topicIds: ['gambling-gaming-law'] },
  { url: 'https://calvinayre.com/feed/', label: 'Calvin Ayre', topicIds: ['gambling-gaming-law'] },
  { url: 'https://sbcnews.co.uk/feed/', label: 'SBC News', topicIds: ['gambling-gaming-law'] },
  { url: 'https://www.gamblinginsider.com/feed/', label: 'Gambling Insider', topicIds: ['gambling-gaming-law'] },
  { url: 'https://www.legalsportsreport.com/feed/', label: 'Legal Sports Report', topicIds: ['gambling-gaming-law'] },

  // ── Stock Market ──────────────────────────────────────────────────────────
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', label: 'WSJ Markets', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://www.fool.com/feeds/index.aspx', label: 'Motley Fool', topicIds: ['stock-market', 'vc-startups'] },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines', label: 'MarketWatch Real-time', topicIds: ['stock-market'] },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', label: 'MarketWatch Top', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://seekingalpha.com/market_currents.xml', label: 'Seeking Alpha', topicIds: ['stock-market'] },
  { url: 'https://www.investing.com/rss/news.rss', label: 'Investing.com', topicIds: ['stock-market', 'global-economy'] },

  // ── VC & Startups ─────────────────────────────────────────────────────────
  { url: 'https://techcrunch.com/startups/feed/', label: 'TechCrunch Startups', topicIds: ['vc-startups'] },
  { url: 'https://news.crunchbase.com/feed/', label: 'Crunchbase News', topicIds: ['vc-startups'] },
  { url: 'https://techcrunch.com/venture/feed/', label: 'TechCrunch Venture', topicIds: ['vc-startups'] },
  { url: 'https://sifted.eu/feed/', label: 'Sifted', topicIds: ['vc-startups'] },

  // ── Global Economy ────────────────────────────────────────────────────────
  { url: 'https://www.ft.com/rss/home', label: 'Financial Times', topicIds: ['global-economy', 'stock-market', 'trade-tariffs'] },
  { url: 'https://www.economist.com/latest/rss.xml', label: 'The Economist', topicIds: ['global-economy', 'geopolitics'] },
  { url: 'https://restofworld.org/feed/latest/', label: 'Rest of World', topicIds: ['global-economy', 'emerging-markets'] },

  // ── Real Estate ───────────────────────────────────────────────────────────
  { url: 'https://therealdeal.com/feed/', label: 'The Real Deal', topicIds: ['real-estate'] },
  { url: 'https://www.housingwire.com/feed/', label: 'HousingWire', topicIds: ['real-estate'] },
  { url: 'https://www.bisnow.com/feed', label: 'Bisnow', topicIds: ['real-estate'] },

  // ── Trade & Tariffs ───────────────────────────────────────────────────────
  { url: 'https://www.wto.org/english/news_e/rss_e/rss_e.xml', label: 'WTO News', topicIds: ['trade-tariffs', 'global-economy'] },

  // ── Emerging Markets ──────────────────────────────────────────────────────
  { url: 'https://www.africanews.com/feed', label: 'Africa News', topicIds: ['emerging-markets', 'geopolitics'] },
  { url: 'https://www.scmp.com/rss/91/feed', label: 'South China Morning Post', topicIds: ['emerging-markets', 'geopolitics'] },

  // ── Biotech & Health Tech ─────────────────────────────────────────────────
  { url: 'https://www.statnews.com/feed/', label: 'STAT News', topicIds: ['biotech-health', 'pharma'] },
  { url: 'https://www.fiercepharma.com/rss/xml', label: 'Fierce Pharma', topicIds: ['biotech-health', 'pharma'] },
  { url: 'https://endpts.com/feed/', label: 'Endpoints News', topicIds: ['biotech-health'] },
  { url: 'https://www.biopharmadive.com/feeds/news/', label: 'BioPharma Dive', topicIds: ['biotech-health', 'pharma'] },

  // ── Science ───────────────────────────────────────────────────────────────
  { url: 'https://www.sciencedaily.com/rss/top.xml', label: 'Science Daily', topicIds: ['science'] },
  { url: 'https://www.newscientist.com/feed/home/', label: 'New Scientist', topicIds: ['science'] },
  { url: 'https://www.nature.com/news.rss', label: 'Nature', topicIds: ['science', 'biotech-health'] },
  { url: 'https://phys.org/rss-feed/', label: 'Phys.org', topicIds: ['science', 'space-defense'] },

  // ── Mental Health ─────────────────────────────────────────────────────────
  { url: 'https://www.mentalhealthamerica.net/feed', label: 'Mental Health America', topicIds: ['mental-health'] },
  { url: 'https://www.psychiatrictimes.com/rss', label: 'Psychiatric Times', topicIds: ['mental-health'] },

  // ── Health & Wellness ─────────────────────────────────────────────────────
  { url: 'https://www.healthline.com/rss/news', label: 'Healthline', topicIds: ['health-wellness'] },
  { url: 'https://www.medicalnewstoday.com/rss', label: 'Medical News Today', topicIds: ['health-wellness', 'science'] },

  // ── Climate & Energy ──────────────────────────────────────────────────────
  { url: 'https://www.carbonbrief.org/feed', label: 'Carbon Brief', topicIds: ['climate-energy', 'environment'] },
  { url: 'https://www.iea.org/news.xml', label: 'IEA', topicIds: ['climate-energy', 'nuclear'] },
  { url: 'https://www.renewableenergyworld.com/feed/', label: 'Renewable Energy World', topicIds: ['climate-energy'] },
  { url: 'https://electrek.co/feed/', label: 'Electrek', topicIds: ['climate-energy', 'automotive-ev'] },

  // ── Environment & Biodiversity ────────────────────────────────────────────
  { url: 'https://www.mongabay.com/feed/', label: 'Mongabay', topicIds: ['environment'] },
  { url: 'https://grist.org/feed/', label: 'Grist', topicIds: ['environment', 'climate-energy'] },

  // ── Agriculture ───────────────────────────────────────────────────────────
  { url: 'https://www.agweb.com/rss/news', label: 'AgWeb', topicIds: ['agriculture'] },
  { url: 'https://www.farmprogress.com/rss', label: 'Farm Progress', topicIds: ['agriculture'] },

  // ── Nuclear ───────────────────────────────────────────────────────────────
  { url: 'https://www.world-nuclear-news.org/rss', label: 'World Nuclear News', topicIds: ['nuclear', 'climate-energy'] },

  // ── US Politics ───────────────────────────────────────────────────────────
  { url: 'https://rss.politico.com/politics-news.xml', label: 'Politico', topicIds: ['us-politics', 'elections'] },
  { url: 'https://thehill.com/feed/', label: 'The Hill', topicIds: ['us-politics', 'elections'] },
  { url: 'https://www.axios.com/feeds/topics/politics', label: 'Axios Politics', topicIds: ['us-politics'] },
  { url: 'https://feeds.npr.org/1014/rss.xml', label: 'NPR Politics', topicIds: ['us-politics'] },

  // ── Geopolitics ───────────────────────────────────────────────────────────
  { url: 'https://foreignpolicy.com/feed/', label: 'Foreign Policy', topicIds: ['geopolitics', 'military'] },
  { url: 'https://www.cfr.org/rss.xml', label: 'Council on Foreign Relations', topicIds: ['geopolitics'] },
  { url: 'https://www.bbc.co.uk/news/world/rss.xml', label: 'BBC World News', topicIds: ['geopolitics', 'us-politics'] },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', label: 'Al Jazeera', topicIds: ['geopolitics', 'human-rights'] },

  // ── Military & Defense ────────────────────────────────────────────────────
  { url: 'https://www.defensenews.com/rss/', label: 'Defense News', topicIds: ['military', 'space-defense'] },
  { url: 'https://www.defenseone.com/rss/all/', label: 'Defense One', topicIds: ['military', 'space-defense'] },

  // ── Space & Defense ───────────────────────────────────────────────────────
  { url: 'https://spacenews.com/feed/', label: 'Space News', topicIds: ['space-defense'] },
  { url: 'https://www.nasaspaceflight.com/feed/', label: 'NASASpaceFlight', topicIds: ['space-defense', 'science'] },

  // ── Elections ─────────────────────────────────────────────────────────────
  { url: 'https://fivethirtyeight.com/features/feed/', label: 'FiveThirtyEight', topicIds: ['elections', 'us-politics'] },

  // ── Human Rights ──────────────────────────────────────────────────────────
  { url: 'https://www.hrw.org/rss.xml', label: 'Human Rights Watch', topicIds: ['human-rights'] },
  { url: 'https://www.amnesty.org/en/news/rss/', label: 'Amnesty International', topicIds: ['human-rights'] },

  // ── Immigration ───────────────────────────────────────────────────────────
  { url: 'https://immigrationimpact.com/feed/', label: 'Immigration Impact', topicIds: ['immigration'] },
  { url: 'https://www.migrationpolicy.org/rss.xml', label: 'Migration Policy Institute', topicIds: ['immigration'] },

  // ── Entertainment ─────────────────────────────────────────────────────────
  { url: 'https://variety.com/feed/', label: 'Variety', topicIds: ['entertainment', 'film-tv', 'music'] },
  { url: 'https://deadline.com/feed/', label: 'Deadline', topicIds: ['entertainment', 'film-tv'] },
  { url: 'https://www.hollywoodreporter.com/feed/', label: 'Hollywood Reporter', topicIds: ['entertainment', 'film-tv'] },
  { url: 'https://pitchfork.com/rss/news/feed/r.xml', label: 'Pitchfork', topicIds: ['entertainment'] },

  // ── Film & TV ─────────────────────────────────────────────────────────────
  { url: 'https://www.indiewire.com/feed/', label: 'IndieWire', topicIds: ['film-tv'] },
  { url: 'https://www.screendaily.com/rss', label: 'Screen Daily', topicIds: ['film-tv'] },

  // ── Gaming & Esports ──────────────────────────────────────────────────────
  { url: 'https://kotaku.com/rss', label: 'Kotaku', topicIds: ['gaming-esports'] },
  { url: 'https://www.pcgamer.com/rss/', label: 'PC Gamer', topicIds: ['gaming-esports'] },
  { url: 'https://www.eurogamer.net/feed', label: 'Eurogamer', topicIds: ['gaming-esports'] },
  { url: 'https://www.ign.com/feeds/all', label: 'IGN', topicIds: ['gaming-esports', 'film-tv'] },

  // ── Sports ────────────────────────────────────────────────────────────────
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', label: 'BBC Sport', topicIds: ['sports'] },
  { url: 'https://www.espn.com/espn/rss/news', label: 'ESPN', topicIds: ['sports'] },
  { url: 'https://theathletic.com/rss/', label: 'The Athletic', topicIds: ['sports'] },

  // ── Classical Music & Opera ───────────────────────────────────────────────
  { url: 'https://www.gramophone.co.uk/feed', label: 'Gramophone', topicIds: ['classical-opera'] },
  { url: 'https://www.theguardian.com/music/classical/rss', label: 'Guardian Classical', topicIds: ['classical-opera'] },
  { url: 'https://bachtrack.com/rss', label: 'Bachtrack', topicIds: ['classical-opera'] },
  { url: 'https://www.operawire.com/feed/', label: 'OperaWire', topicIds: ['classical-opera'] },

  // ── Literature & Books ────────────────────────────────────────────────────
  { url: 'https://lithub.com/feed/', label: 'Literary Hub', topicIds: ['literature'] },
  { url: 'https://www.theguardian.com/books/rss', label: 'Guardian Books', topicIds: ['literature'] },
  { url: 'https://www.publishersweekly.com/pw/feeds/latestNews/index.html', label: 'Publishers Weekly', topicIds: ['literature'] },

  // ── Art & Design ──────────────────────────────────────────────────────────
  { url: 'https://hyperallergic.com/feed/', label: 'Hyperallergic', topicIds: ['art-design'] },
  { url: 'https://www.designboom.com/feed/', label: 'Designboom', topicIds: ['art-design', 'architecture'] },
  { url: 'https://www.dezeen.com/feed/', label: 'Dezeen', topicIds: ['art-design', 'architecture'] },

  // ── Architecture ──────────────────────────────────────────────────────────
  { url: 'https://www.archdaily.com/feed/', label: 'ArchDaily', topicIds: ['architecture'] },
  { url: 'https://www.architectural-review.com/feed', label: 'Architectural Review', topicIds: ['architecture'] },

  // ── Food & Drink ──────────────────────────────────────────────────────────
  { url: 'https://eater.com/rss/index.xml', label: 'Eater', topicIds: ['food-drink'] },
  { url: 'https://www.theguardian.com/lifeandstyle/food-and-drink/rss', label: 'Guardian Food', topicIds: ['food-drink'] },
  { url: 'https://www.bonappetit.com/feed/rss', label: 'Bon Appétit', topicIds: ['food-drink'] },

  // ── Fashion & Luxury ──────────────────────────────────────────────────────
  { url: 'https://wwd.com/feed/', label: 'WWD', topicIds: ['fashion-luxury'] },
  { url: 'https://www.businessoffashion.com/feed', label: 'Business of Fashion', topicIds: ['fashion-luxury'] },
  { url: 'https://www.voguebusiness.com/rss', label: 'Vogue Business', topicIds: ['fashion-luxury'] },

  // ── Travel ────────────────────────────────────────────────────────────────
  { url: 'https://www.cntraveler.com/feed/rss', label: 'Condé Nast Traveler', topicIds: ['travel'] },
  { url: 'https://www.lonelyplanet.com/articles/feed', label: 'Lonely Planet', topicIds: ['travel'] },
  { url: 'https://www.theguardian.com/travel/rss', label: 'Guardian Travel', topicIds: ['travel'] },

  // ── Automotive & EVs ──────────────────────────────────────────────────────
  { url: 'https://insideevs.com/feed/latest/', label: 'InsideEVs', topicIds: ['automotive-ev', 'climate-energy'] },
  { url: 'https://www.motortrend.com/feeds/', label: 'MotorTrend', topicIds: ['automotive-ev'] },
  { url: 'https://www.autocar.co.uk/rss', label: 'Autocar', topicIds: ['automotive-ev'] },

  // ── Aviation & Transport ──────────────────────────────────────────────────
  { url: 'https://simpleflying.com/feed/', label: 'Simple Flying', topicIds: ['aviation'] },
  { url: 'https://aviationweek.com/rss.xml', label: 'Aviation Week', topicIds: ['aviation', 'space-defense'] },
  { url: 'https://thepointsguy.com/news/feed/', label: 'The Points Guy', topicIds: ['aviation', 'travel'] },

  // ── Media & Journalism ────────────────────────────────────────────────────
  { url: 'https://www.niemanlab.org/feed/', label: 'Nieman Lab', topicIds: ['media-journalism'] },
  { url: 'https://www.poynter.org/feed/', label: 'Poynter', topicIds: ['media-journalism'] },
  { url: 'https://digiday.com/feed/', label: 'Digiday', topicIds: ['media-journalism', 'social-media-tech'] },

  // ── Labor & Employment ────────────────────────────────────────────────────
  { url: 'https://www.laborpress.org/feed/', label: 'Labor Press', topicIds: ['labor'] },
  { url: 'https://jacobin.com/feed/', label: 'Jacobin', topicIds: ['labor', 'us-politics'] },

  // ── Education ─────────────────────────────────────────────────────────────
  { url: 'https://www.insidehighered.com/rss.xml', label: 'Inside Higher Ed', topicIds: ['education'] },
  { url: 'https://edsurge.com/news.rss', label: 'EdSurge', topicIds: ['education', 'ai-agi'] },

  // ── Religion & Spirituality ───────────────────────────────────────────────
  { url: 'https://www.religionnews.com/feed/', label: 'Religion News Service', topicIds: ['religion', 'judaism'] },
  { url: 'https://www.christianitytoday.com/feeds/articles/news.xml', label: 'Christianity Today', topicIds: ['religion'] },

  // ── Judaism & Jewish World ────────────────────────────────────────────────
  { url: 'https://www.timesofisrael.com/feed/', label: 'Times of Israel', topicIds: ['judaism', 'geopolitics'] },
  { url: 'https://forward.com/feed/', label: 'The Forward', topicIds: ['judaism'] },
  { url: 'https://www.jewishjournal.com/feed/', label: 'Jewish Journal', topicIds: ['judaism'] },
  { url: 'https://www.haaretz.com/cmlink/1.628759', label: 'Haaretz', topicIds: ['judaism', 'geopolitics'] },

  // ── Philosophy & Ethics ───────────────────────────────────────────────────
  { url: 'https://philosophynow.org/rss.xml', label: 'Philosophy Now', topicIds: ['philosophy'] },
  { url: 'https://www.theguardian.com/world/philosophy/rss', label: 'Guardian Philosophy', topicIds: ['philosophy'] },

  // ── Pharmaceuticals ───────────────────────────────────────────────────────
  { url: 'https://www.pharmaceutical-technology.com/feed/', label: 'Pharmaceutical Technology', topicIds: ['pharma'] },
  { url: 'https://www.drugdiscoverytoday.com/rss', label: 'Drug Discovery Today', topicIds: ['pharma', 'biotech-health'] },
  { url: 'https://www.fiercebiotech.com/rss/xml', label: 'Fierce Biotech', topicIds: ['pharma', 'biotech-health'] },
  { url: 'https://www.pharmatimes.com/rss/news_rss.aspx', label: 'PharmaTimes', topicIds: ['pharma'] },

  // ── Reuters (wire — multi-topic) ─────────────────────────────────────────
  { url: 'https://feeds.reuters.com/reuters/topNews', label: 'Reuters Top News', topicIds: ['geopolitics', 'us-politics', 'global-economy'] },
  { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters Business', topicIds: ['global-economy', 'stock-market', 'trade-tariffs'] },
  { url: 'https://feeds.reuters.com/reuters/technologyNews', label: 'Reuters Technology', topicIds: ['consumer-tech', 'ai-agi', 'social-media-tech'] },
  { url: 'https://feeds.reuters.com/reuters/healthNews', label: 'Reuters Health', topicIds: ['health-wellness', 'biotech-health', 'pharma'] },
  { url: 'https://feeds.reuters.com/reuters/scienceNews', label: 'Reuters Science', topicIds: ['science', 'space-defense', 'environment'] },
  { url: 'https://feeds.reuters.com/reuters/worldNews', label: 'Reuters World', topicIds: ['geopolitics', 'military', 'human-rights'] },
  { url: 'https://feeds.reuters.com/reuters/financialsNews', label: 'Reuters Financials', topicIds: ['stock-market', 'global-economy', 'emerging-markets'] },
  { url: 'https://feeds.reuters.com/reuters/companyNews', label: 'Reuters Companies', topicIds: ['vc-startups', 'stock-market'] },
  { url: 'https://feeds.reuters.com/reuters/governmentFilingsNews', label: 'Reuters Gov Filings', topicIds: ['stock-market', 'us-politics'] },

  // ── BBC News (wire — multi-topic) ─────────────────────────────────────────
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', label: 'BBC News', topicIds: ['geopolitics', 'us-politics', 'global-economy'] },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', label: 'BBC Technology', topicIds: ['consumer-tech', 'ai-agi', 'social-media-tech'] },
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', label: 'BBC Science', topicIds: ['science', 'environment', 'climate-energy'] },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', label: 'BBC Health', topicIds: ['health-wellness', 'mental-health', 'biotech-health'] },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', label: 'BBC Business', topicIds: ['global-economy', 'trade-tariffs', 'stock-market'] },
  { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', label: 'BBC Entertainment', topicIds: ['entertainment', 'film-tv', 'classical-opera'] },

  // ── Washington Post ────────────────────────────────────────────────────────
  { url: 'https://feeds.washingtonpost.com/rss/politics', label: 'WashPost Politics', topicIds: ['us-politics', 'elections'] },
  { url: 'https://feeds.washingtonpost.com/rss/world', label: 'WashPost World', topicIds: ['geopolitics', 'military', 'human-rights'] },
  { url: 'https://feeds.washingtonpost.com/rss/business', label: 'WashPost Business', topicIds: ['global-economy', 'trade-tariffs', 'labor'] },
  { url: 'https://feeds.washingtonpost.com/rss/technology', label: 'WashPost Technology', topicIds: ['consumer-tech', 'ai-agi', 'data-privacy'] },
  { url: 'https://feeds.washingtonpost.com/rss/national', label: 'WashPost National', topicIds: ['us-politics', 'immigration', 'labor'] },

  // ── New York Times ────────────────────────────────────────────────────────
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', label: 'NYT Politics', topicIds: ['us-politics', 'elections'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', label: 'NYT World', topicIds: ['geopolitics', 'human-rights', 'military'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', label: 'NYT Business', topicIds: ['global-economy', 'stock-market', 'trade-tariffs'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', label: 'NYT Technology', topicIds: ['consumer-tech', 'ai-agi', 'cybersecurity'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', label: 'NYT Science', topicIds: ['science', 'space-defense', 'environment'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', label: 'NYT Health', topicIds: ['health-wellness', 'biotech-health', 'mental-health'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', label: 'NYT Climate', topicIds: ['climate-energy', 'environment'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', label: 'NYT Economy', topicIds: ['global-economy', 'labor', 'trade-tariffs'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Immigration.xml', label: 'NYT Immigration', topicIds: ['immigration', 'us-politics'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml', label: 'NYT Arts', topicIds: ['art-design', 'film-tv', 'classical-opera', 'literature'] },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/RealEstate.xml', label: 'NYT Real Estate', topicIds: ['real-estate'] },

  // ── The Guardian (additional sections) ───────────────────────────────────
  { url: 'https://www.theguardian.com/us-news/rss', label: 'Guardian US News', topicIds: ['us-politics', 'elections', 'immigration'] },
  { url: 'https://www.theguardian.com/world/rss', label: 'Guardian World', topicIds: ['geopolitics', 'human-rights', 'military'] },
  { url: 'https://www.theguardian.com/technology/rss', label: 'Guardian Technology', topicIds: ['consumer-tech', 'ai-agi', 'data-privacy'] },
  { url: 'https://www.theguardian.com/business/rss', label: 'Guardian Business', topicIds: ['global-economy', 'trade-tariffs', 'labor'] },
  { url: 'https://www.theguardian.com/environment/rss', label: 'Guardian Environment', topicIds: ['environment', 'climate-energy', 'agriculture'] },
  { url: 'https://www.theguardian.com/science/rss', label: 'Guardian Science', topicIds: ['science', 'space-defense'] },
  { url: 'https://www.theguardian.com/society/rss', label: 'Guardian Society', topicIds: ['mental-health', 'health-wellness', 'labor', 'immigration'] },
  { url: 'https://www.theguardian.com/lifeandstyle/rss', label: 'Guardian Life & Style', topicIds: ['food-drink', 'fashion-luxury', 'health-wellness'] },
  { url: 'https://www.theguardian.com/sport/rss', label: 'Guardian Sport', topicIds: ['sports'] },

  // ── Trade & Tariffs (expanded) ────────────────────────────────────────────
  { url: 'https://www.piie.com/rss.xml', label: 'Peterson Inst. Intl Economics', topicIds: ['trade-tariffs', 'global-economy', 'emerging-markets'] },
  { url: 'https://ustr.gov/rss.xml', label: 'USTR', topicIds: ['trade-tariffs'] },
  { url: 'https://www.trade.gov/rss.xml', label: 'US Trade.gov', topicIds: ['trade-tariffs', 'emerging-markets'] },
  { url: 'https://www.politico.com/rss/economy.xml', label: 'Politico Economy', topicIds: ['trade-tariffs', 'global-economy', 'us-politics'] },

  // ── Emerging Markets (expanded) ───────────────────────────────────────────
  { url: 'https://www.bloomberg.com/feed/podcast/bloomberg-emerging-markets.xml', label: 'Bloomberg EM', topicIds: ['emerging-markets', 'global-economy'] },
  { url: 'https://www.ft.com/emerging-markets?format=rss', label: 'FT Emerging Markets', topicIds: ['emerging-markets', 'global-economy'] },
  { url: 'https://www.reuters.com/rss/emerging-markets', label: 'Reuters Emerging Markets', topicIds: ['emerging-markets'] },
  { url: 'https://www.devex.com/news/rss.xml', label: 'Devex (Development)', topicIds: ['emerging-markets', 'human-rights'] },
  { url: 'https://eastasiaforum.org/feed/', label: 'East Asia Forum', topicIds: ['emerging-markets', 'geopolitics'] },
  { url: 'https://www.businessdailyafrica.com/rss', label: 'Business Daily Africa', topicIds: ['emerging-markets'] },

  // ── Data Privacy (dedicated feeds) ───────────────────────────────────────
  { url: 'https://iapp.org/news/rss/', label: 'IAPP Privacy', topicIds: ['data-privacy', 'ai-commercial-law'] },
  { url: 'https://www.databreachtoday.com/rss', label: 'Data Breach Today', topicIds: ['data-privacy', 'cybersecurity'] },
  { url: 'https://gdprhub.eu/index.php?title=Special:RecentChanges&feed=atom', label: 'GDPR Hub', topicIds: ['data-privacy', 'ai-commercial-law'] },

  // ── Mental Health (expanded) ──────────────────────────────────────────────
  { url: 'https://www.psychologytoday.com/us/front-page/feed', label: 'Psychology Today', topicIds: ['mental-health'] },
  { url: 'https://www.nami.org/rss/nami-news', label: 'NAMI', topicIds: ['mental-health'] },
  { url: 'https://www.mind.org.uk/rss', label: 'Mind UK', topicIds: ['mental-health'] },

  // ── Health & Wellness (expanded) ──────────────────────────────────────────
  { url: 'https://www.who.int/rss-feeds/news-english.xml', label: 'WHO News', topicIds: ['health-wellness', 'biotech-health'] },
  { url: 'https://tools.cdc.gov/api/v2/resources/media/404952.rss', label: 'CDC News', topicIds: ['health-wellness'] },
  { url: 'https://feeds.npr.org/1128/rss.xml', label: 'NPR Health', topicIds: ['health-wellness', 'mental-health'] },
  { url: 'https://www.webmd.com/news/rss/health-news', label: 'WebMD', topicIds: ['health-wellness'] },
  { url: 'https://www.everydayhealth.com/news/rss', label: 'Everyday Health', topicIds: ['health-wellness'] },

  // ── Labor & Employment (expanded) ────────────────────────────────────────
  { url: 'https://www.epi.org/feed/', label: 'Economic Policy Institute', topicIds: ['labor', 'global-economy'] },
  { url: 'https://www.shrm.org/rss/pages/rss.aspx', label: 'SHRM', topicIds: ['labor'] },
  { url: 'https://workplacefairnews.com/feed/', label: 'Workplace Fairness', topicIds: ['labor', 'human-rights'] },

  // ── Immigration (expanded) ────────────────────────────────────────────────
  { url: 'https://www.politico.com/rss/immigration.xml', label: 'Politico Immigration', topicIds: ['immigration', 'us-politics'] },
  { url: 'https://www.axios.com/feeds/topics/immigration', label: 'Axios Immigration', topicIds: ['immigration'] },
  { url: 'https://www.unhcr.org/news/rss.xml', label: 'UNHCR News', topicIds: ['immigration', 'human-rights'] },

  // ── Elections (expanded) ──────────────────────────────────────────────────
  { url: 'https://www.axios.com/feeds/topics/elections', label: 'Axios Elections', topicIds: ['elections', 'us-politics'] },
  { url: 'https://ballotpedia.org/wiki/index.php?title=Special:RecentChanges&feed=rss', label: 'Ballotpedia', topicIds: ['elections'] },
  { url: 'https://rss.politico.com/congress-news.xml', label: 'Politico Congress', topicIds: ['elections', 'us-politics'] },

  // ── Nuclear (expanded) ────────────────────────────────────────────────────
  { url: 'https://www.nei.org/rss/news', label: 'Nuclear Energy Institute', topicIds: ['nuclear', 'climate-energy'] },
  { url: 'https://www.powermag.com/feed/?category=nuclear', label: 'Power Magazine Nuclear', topicIds: ['nuclear'] },
  { url: 'https://www.iaea.org/feeds/press-releases.rss', label: 'IAEA', topicIds: ['nuclear', 'geopolitics'] },

  // ── Agriculture (expanded) ────────────────────────────────────────────────
  { url: 'https://www.agriculture.com/news/rss', label: 'Agriculture.com', topicIds: ['agriculture'] },
  { url: 'https://www.foodnavigator.com/rss/news', label: 'Food Navigator', topicIds: ['agriculture', 'food-drink'] },
  { url: 'https://www.reuters.com/rss/agricultural', label: 'Reuters Agriculture', topicIds: ['agriculture', 'global-economy'] },

  // ── Stock Market (expanded) ───────────────────────────────────────────────
  { url: 'https://finance.yahoo.com/news/rssindex', label: 'Yahoo Finance', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', label: 'CNBC Markets', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', label: 'CNBC Tech', topicIds: ['stock-market', 'consumer-tech', 'vc-startups'] },
  { url: 'https://www.barrons.com/feed', label: "Barron's", topicIds: ['stock-market'] },

  // ── Geopolitics & Military (expanded) ────────────────────────────────────
  { url: 'https://www.politico.com/rss/politicopicks.xml', label: 'Politico Top', topicIds: ['us-politics', 'geopolitics', 'trade-tariffs'] },
  { url: 'https://www.axios.com/feeds/topics/national-security', label: 'Axios National Security', topicIds: ['military', 'geopolitics', 'cybersecurity'] },
  { url: 'https://warontherocks.com/feed/', label: 'War on the Rocks', topicIds: ['military', 'geopolitics'] },
  { url: 'https://www.bellingcat.com/feed/', label: 'Bellingcat', topicIds: ['geopolitics', 'military', 'human-rights'] },
  { url: 'https://theintercept.com/feed/?rss', label: 'The Intercept', topicIds: ['geopolitics', 'human-rights', 'data-privacy'] },

  // ── VC & Startups (expanded) ──────────────────────────────────────────────
  { url: 'https://www.axios.com/feeds/topics/startups', label: 'Axios Startups', topicIds: ['vc-startups', 'ai-agi'] },
  { url: 'https://www.businessinsider.com/sai/features/rss', label: 'Business Insider Tech', topicIds: ['vc-startups', 'consumer-tech', 'stock-market'] },
  { url: 'https://hbr.org/feed', label: 'Harvard Business Review', topicIds: ['vc-startups', 'labor', 'global-economy'] },

  // ── Real Estate (expanded) ────────────────────────────────────────────────
  { url: 'https://www.inman.com/feed/', label: 'Inman News', topicIds: ['real-estate'] },
  { url: 'https://www.globest.com/feed/', label: 'GlobeSt', topicIds: ['real-estate'] },
  { url: 'https://commercialobserver.com/feed/', label: 'Commercial Observer', topicIds: ['real-estate'] },

  // ── Sports (expanded) ─────────────────────────────────────────────────────
  { url: 'https://www.si.com/rss/si_topstories.rss', label: 'Sports Illustrated', topicIds: ['sports'] },
  { url: 'https://bleacherreport.com/articles/feed', label: 'Bleacher Report', topicIds: ['sports'] },
  { url: 'https://www.cbssports.com/rss/headlines/', label: 'CBS Sports', topicIds: ['sports'] },
  { url: 'https://www.skysports.com/rss/12040', label: 'Sky Sports', topicIds: ['sports'] },
  { url: 'https://www.sportingnews.com/us/rss', label: 'Sporting News', topicIds: ['sports'] },
  { url: 'https://www.marca.com/en/rss/all.xml', label: 'Marca', topicIds: ['sports'] },
  { url: 'https://www.nfl.com/rss/rsslanding?searchString=news', label: 'NFL News', topicIds: ['sports'] },
  { url: 'https://www.nba.com/feeds/nbanewsfeeds.xml', label: 'NBA News', topicIds: ['sports'] },

  // ── Golf (dedicated) ─────────────────────────────────────────────────────
  { url: 'https://www.golfdigest.com/rss/all-content', label: 'Golf Digest', topicIds: ['sports'] },
  { url: 'https://www.golfchannel.com/rss', label: 'Golf Channel', topicIds: ['sports'] },
  { url: 'https://www.golf.com/feed/', label: 'Golf.com', topicIds: ['sports'] },
  { url: 'https://www.golfweek.com/feed/', label: 'Golfweek', topicIds: ['sports'] },
  { url: 'https://www.espn.com/espn/rss/golf/news', label: 'ESPN Golf', topicIds: ['sports'] },
  { url: 'https://www.pgatour.com/content/pgatour/news.rss.xml', label: 'PGA Tour', topicIds: ['sports'] },
  { url: 'https://europeantour.com/dpworld-tour/news/rss/', label: 'DP World Tour', topicIds: ['sports'] },
  { url: 'https://news.google.com/rss/search?q=golf+PGA+LIV+Masters+Ryder+Cup&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Golf', topicIds: ['sports'] },

  // ── Gaming & Esports (expanded) ───────────────────────────────────────────
  { url: 'https://www.gamespot.com/feeds/news/', label: 'GameSpot', topicIds: ['gaming-esports'] },
  { url: 'https://www.polygon.com/rss/index.xml', label: 'Polygon', topicIds: ['gaming-esports', 'film-tv'] },
  { url: 'https://www.rockpapershotgun.com/feed', label: 'Rock Paper Shotgun', topicIds: ['gaming-esports'] },
  { url: 'https://esports.gg/feed/', label: 'Esports.gg', topicIds: ['gaming-esports'] },

  // ── Social Media & Big Tech (expanded) ───────────────────────────────────
  { url: 'https://www.axios.com/feeds/topics/technology', label: 'Axios Technology', topicIds: ['social-media-tech', 'consumer-tech', 'ai-agi'] },
  { url: 'https://techcrunch.com/feed/', label: 'TechCrunch All', topicIds: ['consumer-tech', 'vc-startups', 'ai-agi', 'social-media-tech'] },

  // ── Google News (one feed per topic — 100 fresh articles each) ────────────
  { url: 'https://news.google.com/rss/search?q=artificial+intelligence+machine+learning&hl=en-US&gl=US&ceid=US:en', label: 'Google News: AI', topicIds: ['ai-agi'] },
  { url: 'https://news.google.com/rss/search?q=cybersecurity+hacking+data+breach&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Cybersecurity', topicIds: ['cybersecurity'] },
  { url: 'https://news.google.com/rss/search?q=cryptocurrency+bitcoin+ethereum+blockchain&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Crypto', topicIds: ['blockchain-crypto'] },
  { url: 'https://news.google.com/rss/search?q=AI+law+regulation+liability&hl=en-US&gl=US&ceid=US:en', label: 'Google News: AI Law', topicIds: ['ai-commercial-law'] },
  { url: 'https://news.google.com/rss/search?q=gambling+law+sports+betting+regulation&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Gambling Law', topicIds: ['gambling-gaming-law'] },
  { url: 'https://news.google.com/rss/search?q=data+privacy+GDPR+data+protection&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Data Privacy', topicIds: ['data-privacy'] },
  { url: 'https://news.google.com/rss/search?q=stock+market+Wall+Street+earnings&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Stock Market', topicIds: ['stock-market'] },
  { url: 'https://news.google.com/rss/search?q=venture+capital+startup+funding&hl=en-US&gl=US&ceid=US:en', label: 'Google News: VC & Startups', topicIds: ['vc-startups'] },
  { url: 'https://news.google.com/rss/search?q=global+economy+inflation+interest+rates&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Global Economy', topicIds: ['global-economy'] },
  { url: 'https://news.google.com/rss/search?q=biotech+clinical+trial+FDA+drug+approval&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Biotech', topicIds: ['biotech-health'] },
  { url: 'https://news.google.com/rss/search?q=climate+change+renewable+energy&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Climate', topicIds: ['climate-energy'] },
  { url: 'https://news.google.com/rss/search?q=SpaceX+NASA+space+exploration&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Space', topicIds: ['space-defense'] },
  { url: 'https://news.google.com/rss/search?q=US+politics+Congress+White+House&hl=en-US&gl=US&ceid=US:en', label: 'Google News: US Politics', topicIds: ['us-politics'] },
  { url: 'https://news.google.com/rss/search?q=geopolitics+foreign+policy+international+relations&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Geopolitics', topicIds: ['geopolitics'] },
  { url: 'https://news.google.com/rss/search?q=entertainment+celebrity+awards+pop+culture&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Entertainment', topicIds: ['entertainment'] },
  { url: 'https://news.google.com/rss/search?q=opera+classical+music+orchestra+symphony&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Classical & Opera', topicIds: ['classical-opera'] },
  { url: 'https://news.google.com/rss/search?q=Judaism+Jewish+Israel+synagogue&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Judaism', topicIds: ['judaism'] },
  { url: 'https://news.google.com/rss/search?q=sports+NFL+NBA+Premier+League+Olympics&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Sports', topicIds: ['sports'] },
  { url: 'https://news.google.com/rss/search?q=real+estate+housing+market+property&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Real Estate', topicIds: ['real-estate'] },
  { url: 'https://news.google.com/rss/search?q=food+restaurant+chef+culinary&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Food & Drink', topicIds: ['food-drink'] },
  { url: 'https://news.google.com/rss/search?q=fashion+luxury+brands+fashion+week&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Fashion', topicIds: ['fashion-luxury'] },
  { url: 'https://news.google.com/rss/search?q=science+research+discovery+physics+biology&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Science', topicIds: ['science'] },
  { url: 'https://news.google.com/rss/search?q=video+games+esports+gaming+industry&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Gaming', topicIds: ['gaming-esports'] },
  { url: 'https://news.google.com/rss/search?q=smartphone+gadgets+Apple+Samsung+consumer+tech&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Consumer Tech', topicIds: ['consumer-tech'] },
  { url: 'https://news.google.com/rss/search?q=movie+film+streaming+Netflix+Hollywood&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Film & TV', topicIds: ['film-tv'] },
  { url: 'https://news.google.com/rss/search?q=books+publishing+literature+author&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Literature', topicIds: ['literature'] },
  { url: 'https://news.google.com/rss/search?q=art+gallery+museum+art+market+design&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Art & Design', topicIds: ['art-design'] },
  { url: 'https://news.google.com/rss/search?q=journalism+media+press+freedom+newsroom&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Media', topicIds: ['media-journalism'] },
  { url: 'https://news.google.com/rss/search?q=mental+health+depression+anxiety+therapy&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Mental Health', topicIds: ['mental-health'] },
  { url: 'https://news.google.com/rss/search?q=travel+tourism+destination+airline&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Travel', topicIds: ['travel'] },
  { url: 'https://news.google.com/rss/search?q=electric+vehicle+Tesla+EV+automotive&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Automotive & EV', topicIds: ['automotive-ev'] },
  { url: 'https://news.google.com/rss/search?q=robotics+automation+humanoid+robot&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Robotics', topicIds: ['robotics'] },
  { url: 'https://news.google.com/rss/search?q=nuclear+energy+fusion+nuclear+power&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Nuclear', topicIds: ['nuclear'] },
  { url: 'https://news.google.com/rss/search?q=tariffs+trade+war+sanctions+WTO&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Trade & Tariffs', topicIds: ['trade-tariffs'] },
  { url: 'https://news.google.com/rss/search?q=election+voting+democracy+electoral&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Elections', topicIds: ['elections'] },
  { url: 'https://news.google.com/rss/search?q=military+armed+forces+defense+Pentagon&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Military', topicIds: ['military'] },
  { url: 'https://news.google.com/rss/search?q=emerging+markets+BRICS+developing+economies&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Emerging Markets', topicIds: ['emerging-markets'] },
  { url: 'https://news.google.com/rss/search?q=airline+aviation+airport+flight&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Aviation', topicIds: ['aviation'] },
  { url: 'https://news.google.com/rss/search?q=agriculture+farming+food+security+crops&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Agriculture', topicIds: ['agriculture'] },
  { url: 'https://news.google.com/rss/search?q=human+rights+civil+liberties+Amnesty&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Human Rights', topicIds: ['human-rights'] },
  { url: 'https://news.google.com/rss/search?q=religion+faith+church+Islam+Buddhism&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Religion', topicIds: ['religion'] },
  { url: 'https://news.google.com/rss/search?q=biodiversity+wildlife+conservation+ecosystem&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Environment', topicIds: ['environment'] },
  { url: 'https://news.google.com/rss/search?q=health+wellness+nutrition+fitness+medicine&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Health & Wellness', topicIds: ['health-wellness'] },
  { url: 'https://news.google.com/rss/search?q=philosophy+ethics+moral+philosophy&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Philosophy', topicIds: ['philosophy'] },
  { url: 'https://news.google.com/rss/search?q=education+university+school+EdTech&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Education', topicIds: ['education'] },
  { url: 'https://news.google.com/rss/search?q=immigration+asylum+border+migration&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Immigration', topicIds: ['immigration'] },
  { url: 'https://news.google.com/rss/search?q=labor+unions+workers+rights+employment&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Labor', topicIds: ['labor'] },
  { url: 'https://news.google.com/rss/search?q=architecture+urban+planning+building+design&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Architecture', topicIds: ['architecture'] },
  { url: 'https://news.google.com/rss/search?q=social+media+Meta+TikTok+content+moderation&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Social Media', topicIds: ['social-media-tech'] },
  { url: 'https://news.google.com/rss/search?q=pharmaceutical+drug+approval+FDA+clinical+trial&hl=en-US&gl=US&ceid=US:en', label: 'Google News: Pharma', topicIds: ['pharma'] },

  // ── Reddit (free public RSS — top posts from the last day) ────────────────
  { url: 'https://www.reddit.com/r/artificial/top/.rss?t=day', label: 'r/artificial', topicIds: ['ai-agi'] },
  { url: 'https://www.reddit.com/r/MachineLearning/top/.rss?t=day', label: 'r/MachineLearning', topicIds: ['ai-agi', 'science'] },
  { url: 'https://www.reddit.com/r/singularity/top/.rss?t=day', label: 'r/singularity', topicIds: ['ai-agi'] },
  { url: 'https://www.reddit.com/r/netsec/top/.rss?t=day', label: 'r/netsec', topicIds: ['cybersecurity'] },
  { url: 'https://www.reddit.com/r/cybersecurity/top/.rss?t=day', label: 'r/cybersecurity', topicIds: ['cybersecurity'] },
  { url: 'https://www.reddit.com/r/CryptoCurrency/top/.rss?t=day', label: 'r/CryptoCurrency', topicIds: ['blockchain-crypto'] },
  { url: 'https://www.reddit.com/r/Bitcoin/top/.rss?t=day', label: 'r/Bitcoin', topicIds: ['blockchain-crypto'] },
  { url: 'https://www.reddit.com/r/ethereum/top/.rss?t=day', label: 'r/ethereum', topicIds: ['blockchain-crypto'] },
  { url: 'https://www.reddit.com/r/technology/top/.rss?t=day', label: 'r/technology', topicIds: ['consumer-tech', 'social-media-tech'] },
  { url: 'https://www.reddit.com/r/robotics/top/.rss?t=day', label: 'r/robotics', topicIds: ['robotics'] },
  { url: 'https://www.reddit.com/r/stocks/top/.rss?t=day', label: 'r/stocks', topicIds: ['stock-market'] },
  { url: 'https://www.reddit.com/r/investing/top/.rss?t=day', label: 'r/investing', topicIds: ['stock-market', 'global-economy'] },
  { url: 'https://www.reddit.com/r/wallstreetbets/top/.rss?t=day', label: 'r/wallstreetbets', topicIds: ['stock-market'] },
  { url: 'https://www.reddit.com/r/startups/top/.rss?t=day', label: 'r/startups', topicIds: ['vc-startups'] },
  { url: 'https://www.reddit.com/r/economics/top/.rss?t=day', label: 'r/economics', topicIds: ['global-economy', 'trade-tariffs'] },
  { url: 'https://www.reddit.com/r/science/top/.rss?t=day', label: 'r/science', topicIds: ['science', 'biotech-health'] },
  { url: 'https://www.reddit.com/r/space/top/.rss?t=day', label: 'r/space', topicIds: ['space-defense'] },
  { url: 'https://www.reddit.com/r/politics/top/.rss?t=day', label: 'r/politics', topicIds: ['us-politics', 'elections'] },
  { url: 'https://www.reddit.com/r/worldnews/top/.rss?t=day', label: 'r/worldnews', topicIds: ['geopolitics', 'military'] },
  { url: 'https://www.reddit.com/r/sports/top/.rss?t=day', label: 'r/sports', topicIds: ['sports'] },
  { url: 'https://www.reddit.com/r/golf/top/.rss?t=day', label: 'r/golf', topicIds: ['sports'] },
  { url: 'https://www.reddit.com/r/gaming/top/.rss?t=day', label: 'r/gaming', topicIds: ['gaming-esports'] },
  { url: 'https://www.reddit.com/r/movies/top/.rss?t=day', label: 'r/movies', topicIds: ['film-tv', 'entertainment'] },
  { url: 'https://www.reddit.com/r/television/top/.rss?t=day', label: 'r/television', topicIds: ['film-tv', 'entertainment'] },
  { url: 'https://www.reddit.com/r/realestate/top/.rss?t=day', label: 'r/realestate', topicIds: ['real-estate'] },
  { url: 'https://www.reddit.com/r/environment/top/.rss?t=day', label: 'r/environment', topicIds: ['environment', 'climate-energy'] },
  { url: 'https://www.reddit.com/r/mentalhealth/top/.rss?t=day', label: 'r/mentalhealth', topicIds: ['mental-health'] },
]
