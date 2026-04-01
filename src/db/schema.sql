-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Channels
CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT 'Anonymous',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Replies
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT 'Anonymous',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attachments
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(10) NOT NULL,
  target_id INTEGER NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  size_bytes INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Replies
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  parent_reply_id INTEGER REFERENCES replies(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT 'Anonymous',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(10) NOT NULL,
  target_id INTEGER NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);