-- Custom topics: users can define any topic by name
CREATE TABLE IF NOT EXISTS user_custom_topics (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     text NOT NULL,
  name        text NOT NULL,
  slug        text NOT NULL,
  icon        text NOT NULL DEFAULT '🔍',
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, slug)
);

CREATE INDEX IF NOT EXISTS user_custom_topics_user_id ON user_custom_topics (user_id);
