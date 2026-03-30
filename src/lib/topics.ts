export type Topic = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
}

export const TOPICS: Topic[] = [
  // Technology & Business
  { id: 'ai-agi',           name: 'Artificial Intelligence',      slug: 'ai-agi',           description: 'Latest in AI, machine learning, and AGI research',              icon: '🤖' },
  { id: 'cybersecurity',    name: 'Cybersecurity',                slug: 'cybersecurity',    description: 'Security threats, breaches, and best practices',                 icon: '🔐' },
  { id: 'blockchain-crypto',name: 'Blockchain & Crypto',          slug: 'blockchain-crypto',description: 'Cryptocurrency, DeFi, NFTs, and blockchain',                    icon: '🔗' },
  { id: 'consumer-tech',    name: 'Consumer Tech',                slug: 'consumer-tech',    description: 'Smartphones, gadgets, apps, and everyday technology',           icon: '📱' },
  { id: 'robotics',         name: 'Robotics & Automation',        slug: 'robotics',         description: 'Robots, industrial automation, and manufacturing',               icon: '🦾' },
  { id: 'social-media-tech',name: 'Social Media & Big Tech',      slug: 'social-media-tech',description: 'Platforms, content moderation, and tech giants',                icon: '📲' },
  // Law & Policy
  { id: 'ai-commercial-law',name: 'AI & Commercial Law',          slug: 'ai-commercial-law',description: 'Legal frameworks and commercial implications of AI',            icon: '⚖️' },
  { id: 'gambling-gaming-law',name:'Gambling & Gaming Law',       slug: 'gambling-gaming-law',description:'Regulations and rulings in gambling and gaming',             icon: '🎰' },
  { id: 'data-privacy',     name: 'Data Privacy',                 slug: 'data-privacy',     description: 'Privacy laws, GDPR, and data protection',                       icon: '🛡️' },
  { id: 'elections',        name: 'Elections & Democracy',        slug: 'elections',        description: 'Voting, electoral systems, and democratic institutions',         icon: '🗳️' },
  { id: 'human-rights',     name: 'Human Rights',                 slug: 'human-rights',     description: 'Civil liberties, humanitarian issues, and NGOs',                icon: '✊' },
  { id: 'immigration',      name: 'Immigration & Migration',      slug: 'immigration',      description: 'Immigration policy, asylum, and migration trends',              icon: '🛂' },
  // Finance & Economy
  { id: 'stock-market',     name: 'Stock Market',                 slug: 'stock-market',     description: 'Market movements, earnings, and investment news',               icon: '📈' },
  { id: 'vc-startups',      name: 'Venture Capital & Startups',   slug: 'vc-startups',      description: 'Funding rounds, startup news, and VC trends',                   icon: '🚀' },
  { id: 'global-economy',   name: 'Global Economy',               slug: 'global-economy',   description: 'Macroeconomics, trade, central banks, and fiscal policy',       icon: '🌍' },
  { id: 'real-estate',      name: 'Real Estate',                  slug: 'real-estate',      description: 'Property markets, housing, and commercial real estate',          icon: '🏠' },
  { id: 'trade-tariffs',    name: 'Trade & Tariffs',              slug: 'trade-tariffs',    description: 'International trade, tariffs, sanctions, and supply chains',    icon: '📦' },
  { id: 'emerging-markets', name: 'Emerging Markets',             slug: 'emerging-markets', description: 'Economies of Asia, Africa, Latin America, and frontier markets', icon: '📊' },
  // Science & Health
  { id: 'biotech-health',   name: 'Biotech & Health Tech',        slug: 'biotech-health',   description: 'Medical breakthroughs and health technology',                   icon: '🧬' },
  { id: 'science',          name: 'Science & Research',           slug: 'science',          description: 'Physics, chemistry, biology, and scientific discoveries',        icon: '🔬' },
  { id: 'mental-health',    name: 'Mental Health',                slug: 'mental-health',    description: 'Psychology, therapy, and mental wellbeing research',            icon: '🧠' },
  { id: 'health-wellness',  name: 'Health & Wellness',            slug: 'health-wellness',  description: 'Nutrition, fitness, public health, and healthy living',          icon: '💊' },
  { id: 'pharma',           name: 'Pharmaceuticals',              slug: 'pharma',           description: 'Drug development, FDA approvals, and pharma industry',          icon: '💉' },
  { id: 'nuclear',          name: 'Nuclear Energy & Policy',      slug: 'nuclear',          description: 'Nuclear power, fusion research, and non-proliferation',         icon: '⚛️' },
  // Environment & Energy
  { id: 'climate-energy',   name: 'Climate & Energy',             slug: 'climate-energy',   description: 'Climate change, renewable energy, and environmental policy',    icon: '🌱' },
  { id: 'environment',      name: 'Environment & Biodiversity',   slug: 'environment',      description: 'Wildlife, oceans, conservation, and ecological science',         icon: '🌿' },
  { id: 'agriculture',      name: 'Agriculture & Food Security',  slug: 'agriculture',      description: 'Farming, crop science, and food supply chains',                  icon: '🌾' },
  // Politics & World Affairs
  { id: 'us-politics',      name: 'US Politics',                  slug: 'us-politics',      description: 'American politics, Congress, White House, and policy',           icon: '🇺🇸' },
  { id: 'geopolitics',      name: 'Geopolitics',                  slug: 'geopolitics',      description: 'International relations, foreign policy, and world affairs',     icon: '🌐' },
  { id: 'military',         name: 'Military & Defense',           slug: 'military',         description: 'Armed forces, weapons systems, and defense procurement',         icon: '🎖️' },
  { id: 'space-defense',    name: 'Space & Defense',              slug: 'space-defense',    description: 'Space exploration, defense technology, and geopolitical security',icon: '🛸' },
  // Culture & Society
  { id: 'entertainment',    name: 'Entertainment',                slug: 'entertainment',    description: 'Celebrity news, awards, music, and pop culture',                 icon: '🎬' },
  { id: 'film-tv',          name: 'Film & Television',            slug: 'film-tv',          description: 'Movies, TV shows, streaming, and the screen industry',           icon: '🎥' },
  { id: 'gaming-esports',   name: 'Gaming & Esports',             slug: 'gaming-esports',   description: 'Video games, esports, and the gaming industry',                  icon: '🎮' },
  { id: 'sports',           name: 'Sports',                       slug: 'sports',           description: 'Football, basketball, tennis, golf, and all major sports',        icon: '🏆' },
  { id: 'classical-opera',  name: 'Classical Music & Opera',      slug: 'classical-opera',  description: 'Orchestras, opera, conductors, and classical performances',      icon: '🎼' },
  { id: 'literature',       name: 'Literature & Books',           slug: 'literature',       description: 'New books, authors, publishing, and literary culture',            icon: '📚' },
  { id: 'art-design',       name: 'Art & Design',                 slug: 'art-design',       description: 'Visual art, galleries, museums, and creative culture',           icon: '🎨' },
  { id: 'architecture',     name: 'Architecture & Urbanism',      slug: 'architecture',     description: 'Buildings, urban planning, and architectural design',             icon: '🏛️' },
  { id: 'food-drink',       name: 'Food & Drink',                 slug: 'food-drink',       description: 'Restaurants, chefs, wine, and culinary culture',                 icon: '🍽️' },
  { id: 'fashion-luxury',   name: 'Fashion & Luxury',             slug: 'fashion-luxury',   description: 'High fashion, luxury brands, and retail trends',                 icon: '👗' },
  { id: 'travel',           name: 'Travel',                       slug: 'travel',           description: 'Destinations, hospitality, and travel trends',                   icon: '✈️' },
  { id: 'judaism',          name: 'Judaism & Jewish World',       slug: 'judaism',          description: 'Jewish culture, Israel, diaspora, and religious life',           icon: '✡️' },
  { id: 'religion',         name: 'Religion & Spirituality',      slug: 'religion',         description: 'Faith communities, theology, and religious affairs',             icon: '🕊️' },
  { id: 'philosophy',       name: 'Philosophy & Ethics',          slug: 'philosophy',       description: 'Moral philosophy, political theory, and applied ethics',         icon: '🤔' },
  // Industry & Infrastructure
  { id: 'automotive-ev',    name: 'Automotive & EVs',             slug: 'automotive-ev',    description: 'Car industry, electric vehicles, and mobility',                  icon: '🚗' },
  { id: 'aviation',         name: 'Aviation & Transport',         slug: 'aviation',         description: 'Airlines, airports, rail, and the future of transport',          icon: '🛫' },
  { id: 'media-journalism', name: 'Media & Journalism',           slug: 'media-journalism', description: 'Press freedom, newsroom business, and journalism trends',        icon: '📰' },
  { id: 'labor',            name: 'Labor & Employment',           slug: 'labor',            description: 'Workers rights, unions, wages, and employment trends',           icon: '👷' },
  { id: 'education',        name: 'Education',                    slug: 'education',        description: 'Schools, universities, EdTech, and education policy',            icon: '🎓' },
]

export const MAX_USER_TOPICS = 12
