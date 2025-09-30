import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/serverSupabaseClient';
import { withLogging } from '@/lib/api/loggingWrapper';
import { createLogger, logError } from '@/lib/logger';

const logger = createLogger('api:channels');

// GET /api/channels - Retrieve a list of channels the user has access to
async function GET(_request: NextRequest) {
  const session = await getServerSession();
  
  // Check if we have the required environment variables before creating the client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // In development, return empty channels if Supabase is not configured
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase not configured, returning empty channels list');
      return NextResponse.json({ channels: [] });
    }
    
    // In production, return error
    logger.error({ 
      type: 'supabase-config-error',
      error: 'Missing Supabase environment variables'
    }, 'Supabase configuration missing');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    // Get public channels always, and user-specific channels if authenticated
    let channels;
    let error;
    
    if (session && session.user) {
      // User is authenticated, get their channels and public channels
      logger.info({ userId: session.user.id, type: 'fetch-channels' }, 'Fetching channels for user');
      
      try {
        const result = await supabase
          .from('channels')
          .select(`
            *,
            channel_memberships!left(user_id),
            member_count:channel_memberships(count)
          `)
          .or(`privacy.eq.public,channel_memberships.user_id.eq.${session.user.id}`)
          .order('created_at', { ascending: false });
        
        channels = result.data;
        error = result.error;
      } catch (queryError: Error) {
        // Handle case where channels table might not exist
        logger.warn({
          userId: session.user.id,
          error: queryError.message,
          type: 'channels-query-error'
        }, 'Error querying channels, may not exist yet');
        
        // Return empty array if the channels table doesn't exist
        if (queryError.message.includes('does not exist')) {
          logger.info({ userId: session.user.id, type: 'channels-not-exist' }, 'Channels table does not exist yet');
          return NextResponse.json({ channels: [] });
        }
        
        logError(logger, queryError, { userId: session.user.id, operation: 'fetch-channels' });
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
      }
    } else {
      // User is not authenticated, only get public channels
      logger.info({ type: 'fetch-public-channels' }, 'Fetching public channels for unauthenticated user');
      
      try {
        // For unauthenticated users, just get public channels without memberships
        const result = await supabase
          .from('channels')
          .select('*')
          .eq('privacy', 'public')
          .order('created_at', { ascending: false });
        
        channels = result.data;
        error = result.error;
        
        // Add default member_count if not present
        if (channels) {
          channels = channels.map((channel: Channel) => ({
            ...channel,
            member_count: channel.member_count || 0
          }));
        }
      } catch (queryError: Error) {
        // Handle case where channels table might not exist
        logger.warn({
          error: queryError.message,
          type: 'channels-query-error'
        }, 'Error querying public channels, may not exist yet');
        
        // Return empty array if the channels table doesn't exist
        if (queryError.message.includes('does not exist')) {
          logger.info({ type: 'channels-not-exist' }, 'Channels table does not exist yet');
          return NextResponse.json({ channels: [] });
        }
        
        logError(logger, queryError, { operation: 'fetch-public-channels' });
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
      }
    }
    
    if (error) {
      logError(logger, error, { 
        userId: session?.user?.id, 
        operation: 'fetch-channels' 
      });
      // Handle case where channels table might not exist
      if (error.message.includes('does not exist')) {
        logger.info({ 
          userId: session?.user?.id, 
          type: 'channels-not-exist' 
        }, 'Channels table does not exist yet');
        return NextResponse.json({ channels: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }
    
    // Process the member count for all channels
    const processedChannels = (channels || [])
      .map((channel: Channel) => ({
        ...channel,
        member_count: channel.member_count?.[0]?.count || 0
      }));
    
    if (session && session.user) {
      logger.info({ 
        userId: session.user.id, 
        channelCount: processedChannels.length,
        type: 'channels-fetched' 
      }, 'Successfully fetched channels for user');
    } else {
      logger.info({ 
        channelCount: processedChannels.length,
        type: 'public-channels-fetched' 
      }, 'Successfully fetched public channels');
    }
    
    return NextResponse.json({ channels: processedChannels });
  } catch (error: Error) {
    logError(logger, error, { 
      userId: session?.user?.id, 
      operation: 'fetch-channels' 
    });
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
  
  // Check if we have the required environment variables before creating the client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // In development, return a clear error message about configuration
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase not configured, cannot create channel');
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Supabase environment variables. Please check your .env.local file.' 
      }, { status: 500 });
    }
    
    // In production, return generic error
    logger.error({ 
      type: 'supabase-config-error',
      error: 'Missing Supabase environment variables'
    }, 'Supabase configuration missing');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
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
      logError(logger, channelError, { userId: session.user.id, operation: 'create-channel' });
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
      logError(logger, membershipError, { userId: session.user.id, operation: 'add-member' });
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
  } catch (error: Error) {
    logError(logger, error, { userId: session.user.id, operation: 'create-channel' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export the wrapped handlers
const GETHandler = withLogging(GET, 'channels');
const POSTHandler = withLogging(POST, 'channels');

export { GETHandler as GET, POSTHandler as POST };