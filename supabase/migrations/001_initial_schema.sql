-- Users (synced from Clerk webhook)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topics
CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_domain TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  raw_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Article summaries (Claude-generated)
CREATE TABLE article_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  bullets TEXT[] NOT NULL DEFAULT '{}',
  one_liner TEXT,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (article_id)
);

-- Article-topic associations
CREATE TABLE article_topics (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  relevance_score FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (article_id, topic_id)
);

-- Cross-topic flags
CREATE TABLE cross_topic_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  topic_ids TEXT[] NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User topic selections (up to 6 per user)
CREATE TABLE user_topics (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  priority_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);

-- User source ratings (1-5 stars)
CREATE TABLE user_source_ratings (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_domain TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, source_domain)
);

-- User article ratings (thumbs up/down)
CREATE TABLE user_article_ratings (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- User affinity profiles (keyword + topic weights derived from ratings)
CREATE TABLE user_affinity_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  keywords JSONB NOT NULL DEFAULT '{}',
  topic_weights JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_source_domain ON articles(source_domain);
CREATE INDEX idx_article_topics_topic_id ON article_topics(topic_id);
CREATE INDEX idx_article_topics_relevance ON article_topics(relevance_score DESC);
CREATE INDEX idx_article_summaries_is_breaking ON article_summaries(is_breaking) WHERE is_breaking = true;
CREATE INDEX idx_user_topics_user_id ON user_topics(user_id);
CREATE INDEX idx_user_article_ratings_user_id ON user_article_ratings(user_id);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Seed topics
INSERT INTO topics (id, name, slug, description, icon) VALUES
  ('ai-agi',              'Artificial Intelligence & AGI',  'ai-agi',              'Latest developments in AI, machine learning, and the path toward AGI',  '🤖'),
  ('cybersecurity',       'Cybersecurity',                  'cybersecurity',       'Security threats, breaches, tools, and best practices',                  '🔐'),
  ('blockchain-crypto',   'Blockchain & Crypto',            'blockchain-crypto',   'Cryptocurrency, DeFi, NFTs, and blockchain technology',                  '🔗'),
  ('ai-commercial-law',   'AI & Commercial Law',            'ai-commercial-law',   'Legal frameworks, regulations, and commercial implications of AI',        '⚖️'),
  ('gambling-gaming-law', 'Gambling & Gaming Law',          'gambling-gaming-law', 'Regulations, rulings, and policy changes in gambling and gaming',         '🎰'),
  ('data-privacy',        'Data Privacy & Regulation',      'data-privacy',        'Privacy laws, GDPR, data protection, and compliance',                    '🛡️'),
  ('stock-market',        'Stock Market',                   'stock-market',        'Market movements, earnings, analysis, and investment news',               '📈'),
  ('vc-startups',         'Venture Capital & Startups',     'vc-startups',         'Funding rounds, startup news, and VC trends',                            '🚀'),
  ('global-economy',      'Global Economy',                 'global-economy',      'Macroeconomics, trade, central banks, and fiscal policy',                 '🌍'),
  ('biotech-health',      'Biotech & Health Tech',          'biotech-health',      'Medical breakthroughs, health technology, and pharma news',               '🧬'),
  ('climate-energy',      'Climate & Energy',               'climate-energy',      'Climate change, renewable energy, and environmental policy',              '🌱'),
  ('space-defense',       'Space & Defense',                'space-defense',       'Space exploration, defense technology, and geopolitical security',        '🛸');

-- Digest sent log (prevents duplicate digests within same hour)
CREATE TABLE digest_sent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
