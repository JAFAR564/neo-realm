# Channels System Technical Specification

## Overview
This document outlines the technical implementation of the channels system for Phase 2 of the NeoRealm project. Channels will allow users to participate in different conversation spaces for various topics and storylines.

## Database Schema Changes

### Channels Table
```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id),
  privacy TEXT CHECK (privacy IN ('public', 'private', 'unlisted')) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_channels_creator ON channels(creator_id);
CREATE INDEX idx_channels_privacy ON channels(privacy);
CREATE INDEX idx_channels_created_at ON channels(created_at);
```

### Messages Table Modification
```sql
-- Add channel_id column to messages table
ALTER TABLE messages 
ADD COLUMN channel_id UUID REFERENCES channels(id) DEFAULT NULL;

-- Update existing messages to belong to a default "General" channel
-- This would be done after creating the default channel

-- Index for performance
CREATE INDEX idx_messages_channel ON messages(channel_id);
```

### Channel Memberships Table (for private channels)
```sql
CREATE TABLE channel_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_channel_memberships_channel ON channel_memberships(channel_id);
CREATE INDEX idx_channel_memberships_user ON channel_memberships(user_id);
CREATE INDEX idx_channel_memberships_role ON channel_memberships(role);
```

## API Endpoints

### Channel Management

#### GET /api/channels
Retrieve a list of channels the user has access to

**Response**:
```json
{
  "channels": [
    {
      "id": "uuid",
      "name": "General",
      "description": "Main channel for all users",
      "privacy": "public",
      "member_count": 42,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/channels
Create a new channel

**Request**:
```json
{
  "name": "Cyberpunk Lore",
  "description": "Discussion about cyberpunk worldbuilding",
  "privacy": "public"
}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "Cyberpunk Lore",
  "description": "Discussion about cyberpunk worldbuilding",
  "creator_id": "user_uuid",
  "privacy": "public",
  "created_at": "2023-01-01T00:00:00Z"
}
```

#### GET /api/channels/{channel_id}
Retrieve details for a specific channel

**Response**:
```json
{
  "id": "uuid",
  "name": "Cyberpunk Lore",
  "description": "Discussion about cyberpunk worldbuilding",
  "creator_id": "user_uuid",
  "privacy": "public",
  "created_at": "2023-01-01T00:00:00Z",
  "member_count": 15,
  "is_member": true
}
```

#### PUT /api/channels/{channel_id}
Update a channel's details

#### DELETE /api/channels/{channel_id}
Delete a channel (only by creator or admin)

### Channel Membership

#### POST /api/channels/{channel_id}/join
Join a public or unlisted channel

#### POST /api/channels/{channel_id}/request
Request to join a private channel

#### DELETE /api/channels/{channel_id}/leave
Leave a channel

#### GET /api/channels/{channel_id}/members
Retrieve members of a channel

#### PUT /api/channels/{channel_id}/members/{user_id}/role
Update a member's role (admin/moderator only)

#### DELETE /api/channels/{channel_id}/members/{user_id}
Remove a member from channel (admin/moderator only)

## Frontend Components

### ChannelSidebar
A sidebar component that displays available channels and allows navigation between them.

**Props**:
- `channels`: Array of channel objects
- `currentChannel`: Currently selected channel
- `onChannelSelect`: Function to handle channel selection
- `onCreateChannel`: Function to open channel creation modal

### ChannelList
A component that displays a list of channels with search and filter capabilities.

**Props**:
- `channels`: Array of channel objects
- `onChannelSelect`: Function to handle channel selection
- `searchTerm`: Current search term
- `onSearchChange`: Function to handle search input changes

### ChannelCreationModal
A modal form for creating new channels.

**Props**:
- `isOpen`: Boolean indicating if modal is open
- `onClose`: Function to close the modal
- `onCreate`: Function to handle channel creation

### ChannelHeader
A header component that displays channel information and actions.

**Props**:
- `channel`: Channel object
- `onJoin`: Function to join the channel
- `onLeave`: Function to leave the channel
- `onDelete`: Function to delete the channel

## Supabase Integration

### Real-time Subscriptions
```javascript
// Subscribe to channel changes
const channelSubscription = supabase
  .channel('channels')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'channels'
    },
    (payload) => {
      // Add new channel to state
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'channels'
    },
    (payload) => {
      // Update channel in state
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'channels'
    },
    (payload) => {
      // Remove channel from state
    }
  )
  .subscribe();
```

### Database Queries

#### Get Public Channels
```javascript
const { data, error } = await supabase
  .from('channels')
  .select('*')
  .eq('privacy', 'public')
  .order('created_at', { ascending: false });
```

#### Get User's Channels
```javascript
const { data, error } = await supabase
  .from('channels')
  .select(`
    *,
    channel_memberships!inner(user_id)
  `)
  .eq('channel_memberships.user_id', userId);
```

#### Create Channel
```javascript
const { data, error } = await supabase
  .from('channels')
  .insert([
    {
      name: 'Channel Name',
      description: 'Channel Description',
      creator_id: userId,
      privacy: 'public'
    }
  ])
  .select();
```

## Security Considerations

### Row Level Security (RLS) Policies

#### Channels Table Policies
```sql
-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Channels are viewable by everyone for public channels"
  ON channels FOR SELECT
  USING (privacy = 'public');

CREATE POLICY "Users can view channels they are members of"
  ON channels FOR SELECT
  USING (
    id IN (
      SELECT channel_id 
      FROM channel_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create channels"
  ON channels FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Channel creators can update their channels"
  ON channels FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Channel creators can delete their channels"
  ON channels FOR DELETE
  USING (auth.uid() = creator_id);
```

#### Channel Memberships Policies
```sql
-- Enable RLS
ALTER TABLE channel_memberships ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Memberships are viewable by members of the channel"
  ON channel_memberships FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE privacy = 'public'
    )
    OR channel_id IN (
      SELECT channel_id 
      FROM channel_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public channels"
  ON channel_memberships FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE privacy = 'public'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can leave channels"
  ON channel_memberships FOR DELETE
  USING (
    user_id = auth.uid()
    AND channel_id IN (
      SELECT channel_id 
      FROM channel_memberships 
      WHERE user_id = auth.uid() AND role != 'admin'
    )
  );

CREATE POLICY "Admins can remove members"
  ON channel_memberships FOR DELETE
  USING (
    channel_id IN (
      SELECT channel_id 
      FROM channel_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Testing Plan

### Unit Tests
1. Test channel creation with valid and invalid data
2. Test channel membership operations
3. Test channel visibility based on privacy settings
4. Test real-time subscription functionality

### Integration Tests
1. Test end-to-end channel creation and management flow
2. Test channel joining and leaving workflows
3. Test message posting in different channels
4. Test channel deletion and cleanup

### Performance Tests
1. Test loading times with 100+ channels
2. Test real-time updates with 50+ concurrent users
3. Test database query performance with large datasets

## Migration Plan

### Step 1: Database Schema Updates
1. Create channels table
2. Add channel_id column to messages table
3. Create channel_memberships table
4. Set up RLS policies

### Step 2: Data Migration
1. Create a default "General" channel
2. Migrate existing messages to the "General" channel
3. Update any existing queries to handle channel_id

### Step 3: API Implementation
1. Implement channel management endpoints
2. Implement channel membership endpoints
3. Update message endpoints to handle channels

### Step 4: Frontend Implementation
1. Create channel sidebar component
2. Implement channel list and creation UI
3. Update terminal chat to work with channels
4. Add channel navigation

### Step 5: Testing and Deployment
1. Conduct thorough testing
2. Fix any issues
3. Deploy to production
4. Monitor for issues