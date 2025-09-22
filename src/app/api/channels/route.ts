import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/serverSupabaseClient';
import { withLogging } from '@/lib/api/loggingWrapper';
import { createLogger, logError } from '@/lib/logger';

const logger = createLogger('api:channels');

// GET /api/channels - Retrieve a list of channels the user has access to
async function GET(_request: NextRequest) {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    logger.warn({ type: 'unauthorized' }, 'Unauthorized access attempt to channels API');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    logger.info({ userId: session.user.id, type: 'fetch-channels' }, 'Fetching channels for user');
    
    // Add a test log to verify our logging system
    logger.debug({ test: 'logging-system', userId: session.user.id }, 'Testing debug log from channels API');
    
    // Get public channels and channels the user is a member of
    // Optimized query that gets member count in a single query
    const { data: channels, error } = await supabase
      .from('channels')
      .select(`
        *,
        channel_memberships!left(user_id),
        member_count:channel_memberships(count)
      `)
      .or(`privacy.eq.public,channel_memberships.user_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      logError(logger, error as Error, { userId: session.user.id, operation: 'fetch-channels' });
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }
    
    // Remove duplicate channels (public channels that user is also a member of)
    // and process the member count
    const processedChannels = channels
      .filter((channel, index, self) => 
        index === self.findIndex(c => c.id === channel.id)
      )
      .map(channel => ({
        ...channel,
        member_count: channel.member_count?.[0]?.count || 0
      }));
    
    logger.info({ 
      userId: session.user.id, 
      channelCount: processedChannels.length,
      type: 'channels-fetched' 
    }, 'Successfully fetched channels for user');
    
    return NextResponse.json({ channels: processedChannels });
  } catch (error) {
    logError(logger, error as Error, { userId: session.user.id, operation: 'fetch-channels' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/channels - Create a new channel
async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    logger.warn({ type: 'unauthorized' }, 'Unauthorized access attempt to channels API');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const body = await request.json();
    const { name, description, privacy } = body;
    
    logger.info({ 
      userId: session.user.id, 
      channelName: name,
      privacy,
      type: 'create-channel' 
    }, 'Creating new channel');
    
    // Validate input
    if (!name || name.trim().length === 0) {
      logger.warn({ 
        userId: session.user.id, 
        type: 'validation-error' 
      }, 'Channel name is required');
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 });
    }
    
    if (name.length > 50) {
      logger.warn({ 
        userId: session.user.id, 
        channelName: name,
        type: 'validation-error' 
      }, 'Channel name must be 50 characters or less');
      return NextResponse.json({ error: 'Channel name must be 50 characters or less' }, { status: 400 });
    }
    
    if (description && description.length > 500) {
      logger.warn({ 
        userId: session.user.id, 
        channelName: name,
        type: 'validation-error' 
      }, 'Channel description must be 500 characters or less');
      return NextResponse.json({ error: 'Channel description must be 500 characters or less' }, { status: 400 });
    }
    
    // Create the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
          creator_id: session.user.id,
          privacy: privacy || 'public'
        }
      ])
      .select()
      .single();
    
    if (channelError) {
      logError(logger, channelError as Error, { userId: session.user.id, operation: 'create-channel' });
      return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
    }
    
    // Add creator as admin member
    const { error: membershipError } = await supabase
      .from('channel_memberships')
      .insert([
        {
          channel_id: channel.id,
          user_id: session.user.id,
          role: 'admin'
        }
      ]);
    
    if (membershipError) {
      logError(logger, membershipError as Error, { userId: session.user.id, operation: 'add-member' });
      // Don't return error here as the channel was created successfully
    }
    
    // Add member count to the response
    const channelWithMemberCount = {
      ...channel,
      member_count: 1
    };
    
    logger.info({ 
      userId: session.user.id, 
      channelId: channel.id,
      channelName: channel.name,
      type: 'channel-created' 
    }, 'Successfully created channel');
    
    return NextResponse.json(channelWithMemberCount);
  } catch (error) {
    logError(logger, error as Error, { userId: session.user.id, operation: 'create-channel' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export the wrapped handlers
const GETHandler = withLogging(GET, 'channels');
const POSTHandler = withLogging(POST, 'channels');

export { GETHandler as GET, POSTHandler as POST };