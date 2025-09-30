-- Apply channels functionality to existing database
-- This script should be run after the channels tables are created

-- 1. Create channels and channel_memberships tables if they don't exist
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id),
  privacy TEXT CHECK (privacy IN ('public', 'private', 'unlisted')) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- 2. Add channel_id column to messages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'channel_id') THEN
        ALTER TABLE messages ADD COLUMN channel_id UUID REFERENCES channels(id);
    END IF;
END $$;

-- 3. Create the General channel if it doesn't exist
INSERT INTO channels (name, description, privacy) 
SELECT 'General', 'Main channel for all users', 'public'
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'General');

-- 4. Update existing messages to belong to the General channel
UPDATE messages 
SET channel_id = (SELECT id FROM channels WHERE name = 'General')
WHERE channel_id IS NULL;

-- 5. Make channel_id NOT NULL after updating existing messages
ALTER TABLE messages 
ALTER COLUMN channel_id SET NOT NULL;

-- 6. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS channels_creator_idx ON channels(creator_id);
CREATE INDEX IF NOT EXISTS channels_privacy_idx ON channels(privacy);
CREATE INDEX IF NOT EXISTS channels_created_at_idx ON channels(created_at);
CREATE INDEX IF NOT EXISTS messages_channel_idx ON messages(channel_id);
CREATE INDEX IF NOT EXISTS channel_memberships_channel_idx ON channel_memberships(channel_id);
CREATE INDEX IF NOT EXISTS channel_memberships_user_idx ON channel_memberships(user_id);
CREATE INDEX IF NOT EXISTS channel_memberships_role_idx ON channel_memberships(role);

-- 7. Add comment to explain the channels table
COMMENT ON TABLE channels IS 'Chat channels for different topics and storylines';