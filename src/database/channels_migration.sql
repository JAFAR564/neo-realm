-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id),
  privacy TEXT CHECK (privacy IN ('public', 'private', 'unlisted')) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add channel_id column to messages table
ALTER TABLE messages 
ADD COLUMN channel_id UUID REFERENCES channels(id);

-- Channel memberships table (for private channels)
CREATE TABLE channel_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS channels_creator_idx ON channels(creator_id);
CREATE INDEX IF NOT EXISTS channels_privacy_idx ON channels(privacy);
CREATE INDEX IF NOT EXISTS channels_created_at_idx ON channels(created_at);
CREATE INDEX IF NOT EXISTS messages_channel_idx ON messages(channel_id);
CREATE INDEX IF NOT EXISTS channel_memberships_channel_idx ON channel_memberships(channel_id);
CREATE INDEX IF NOT EXISTS channel_memberships_user_idx ON channel_memberships(user_id);
CREATE INDEX IF NOT EXISTS channel_memberships_role_idx ON channel_memberships(role);

-- Create a default "General" channel
INSERT INTO channels (name, description, privacy) 
VALUES ('General', 'Main channel for all users', 'public');

-- Update existing messages to belong to the "General" channel
UPDATE messages SET channel_id = (SELECT id FROM channels WHERE name = 'General');

-- Make channel_id NOT NULL after updating existing messages
ALTER TABLE messages 
ALTER COLUMN channel_id SET NOT NULL;

-- Add a comment to explain the default channel
COMMENT ON TABLE channels IS 'Chat channels for different topics and storylines';