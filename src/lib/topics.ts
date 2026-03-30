export type Topic = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
}

export const TOPICS: Topic[] = [
  {
    id: 'ai-agi',
    name: 'Artificial Intelligence & AGI',
    slug: 'ai-agi',
    description: 'Latest developments in AI, machine learning, and the path toward AGI',
    icon: '🤖',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security threats, breaches, tools, and best practices',
    icon: '🔐',
  },
  {
    id: 'blockchain-crypto',
    name: 'Blockchain & Crypto',
    slug: 'blockchain-crypto',
    description: 'Cryptocurrency, DeFi, NFTs, and blockchain technology',
    icon: '🔗',
  },
  {
    id: 'ai-commercial-law',
    name: 'AI & Commercial Law',
    slug: 'ai-commercial-law',
    description: 'Legal frameworks, regulations, and commercial implications of AI',
    icon: '⚖️',
  },
  {
    id: 'gambling-gaming-law',
    name: 'Gambling & Gaming Law',
    slug: 'gambling-gaming-law',
    description: 'Regulations, rulings, and policy changes in gambling and gaming',
    icon: '🎰',
  },
  {
    id: 'data-privacy',
    name: 'Data Privacy & Regulation',
    slug: 'data-privacy',
    description: 'Privacy laws, GDPR, data protection, and compliance',
    icon: '🛡️',
  },
  {
    id: 'stock-market',
    name: 'Stock Market',
    slug: 'stock-market',
    description: 'Market movements, earnings, analysis, and investment news',
    icon: '📈',
  },
  {
    id: 'vc-startups',
    name: 'Venture Capital & Startups',
    slug: 'vc-startups',
    description: 'Funding rounds, startup news, and VC trends',
    icon: '🚀',
  },
  {
    id: 'global-economy',
    name: 'Global Economy',
    slug: 'global-economy',
    description: 'Macroeconomics, trade, central banks, and fiscal policy',
    icon: '🌍',
  },
  {
    id: 'biotech-health',
    name: 'Biotech & Health Tech',
    slug: 'biotech-health',
    description: 'Medical breakthroughs, health technology, and pharma news',
    icon: '🧬',
  },
  {
    id: 'climate-energy',
    name: 'Climate & Energy',
    slug: 'climate-energy',
    description: 'Climate change, renewable energy, and environmental policy',
    icon: '🌱',
  },
  {
    id: 'space-defense',
    name: 'Space & Defense',
    slug: 'space-defense',
    description: 'Space exploration, defense technology, and geopolitical security',
    icon: '🛸',
  },
]

export const MAX_USER_TOPICS = 6
