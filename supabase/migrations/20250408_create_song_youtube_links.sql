-- Create table for song YouTube links
CREATE TABLE IF NOT EXISTS song_youtube_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  video_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_song_youtube_links_song_id ON song_youtube_links(song_id);
