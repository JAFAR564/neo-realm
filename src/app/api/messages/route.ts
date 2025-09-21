import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/serverSupabaseClient';

// GET /api/messages?channelId=... - Retrieve messages for a specific channel
export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    
    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }
    
    // Check if user has access to this channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('privacy')
      .eq('id', channelId)
      .single();
    
    if (channelError) {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    if (channel.privacy !== 'public') {
      const { data: membership } = await supabase
        .from('channel_memberships')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', session.user.id)
        .single();
      
      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    
    // Get messages for this channel with user profiles and reactions
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        user_id,
        content,
        message_type,
        created_at,
        profiles:profiles(id, username, avatar_url, character_class),
        reactions(*)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
    
    // Format messages with user data
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      user_id: msg.user_id,
      content: msg.content,
      message_type: msg.message_type,
      created_at: msg.created_at,
      username: (msg.profiles as { username?: string })?.username || 'Unknown',
      avatar_url: (msg.profiles as { avatar_url?: string | null })?.avatar_url || null,
      character_class: (msg.profiles as { character_class?: string | null })?.character_class || null,
      reactions: msg.reactions || []
    }));
    
    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages - Create a new message
export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const { channelId, content, messageType } = await request.json();
    
    // Validate input
    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }
    
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message content must be 1000 characters or less' }, { status: 400 });
    }
    
    // Check if user has access to this channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('privacy')
      .eq('id', channelId)
      .single();
    
    if (channelError) {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    if (channel.privacy !== 'public') {
      const { data: membership } = await supabase
        .from('channel_memberships')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', session.user.id)
        .single();
      
      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    
    // Validate message type
    const validMessageTypes = ['chat', 'action', 'dice_roll', 'system'];
    const type = validMessageTypes.includes(messageType) ? messageType : 'chat';
    
    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          user_id: session.user.id,
          channel_id: channelId,
          content: content.trim(),
          message_type: type
        }
      ])
      .select(`
        id,
        user_id,
        content,
        message_type,
        created_at,
        profiles:profiles(id, username, avatar_url, character_class)
      `)
      .single();
    
    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
    
    // Format the message
    const formattedMessage = {
      id: message.id,
      user_id: message.user_id,
      content: message.content,
      message_type: message.message_type,
      created_at: message.created_at,
      username: (message.profiles as { username?: string })?.username || 'Unknown',
      avatar_url: (message.profiles as { avatar_url?: string | null })?.avatar_url || null,
      character_class: (message.profiles as { character_class?: string | null })?.character_class || null,
      reactions: []
    };
    
    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}