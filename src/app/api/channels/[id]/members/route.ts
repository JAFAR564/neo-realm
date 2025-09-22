import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/serverSupabaseClient';

// GET /api/channels/[id]/members - Retrieve members of a channel
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  const params = await context.params;
  const channelId = params.id;
  
  try {
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
    
    // Get channel members with profile information
    const { data: members, error: membersError } = await supabase
      .from('channel_memberships')
      .select(`
        role,
        joined_at,
        profiles:user_id(username, avatar_url, character_class)
      `)
      .eq('channel_id', channelId)
      .order('joined_at', { ascending: true });
    
    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
    
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error in GET /api/channels/[id]/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/channels/[id]/join - Join a public or unlisted channel
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  const params = await context.params;
  const channelId = params.id;
  
  try {
    // Get the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('privacy')
      .eq('id', channelId)
      .single();
    
    if (channelError) {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Only allow joining public channels directly
    if (channel.privacy !== 'public') {
      return NextResponse.json({ error: 'Cannot join private channels directly' }, { status: 400 });
    }
    
    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('channel_memberships')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member of this channel' }, { status: 400 });
    }
    
    // Add user as member
    const { data: membership, error: membershipError } = await supabase
      .from('channel_memberships')
      .insert([
        {
          channel_id: channelId,
          user_id: session.user.id,
          role: 'member'
        }
      ])
      .select()
      .single();
    
    if (membershipError) {
      console.error('Error joining channel:', membershipError);
      return NextResponse.json({ error: 'Failed to join channel' }, { status: 500 });
    }
    
    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error in POST /api/channels/[id]/join:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/channels/[id]/leave - Leave a channel
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  const params = await context.params;
  const channelId = params.id;
  
  try {
    // Check if user is a member
    const { data: membership, error: membershipError } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this channel' }, { status: 400 });
    }
    
    // Admins cannot leave their own channel, they must delete it
    if (membership.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot leave channels. Delete the channel instead.' }, { status: 400 });
    }
    
    // Remove user from channel
    const { error: deleteError } = await supabase
      .from('channel_memberships')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id);
    
    if (deleteError) {
      console.error('Error leaving channel:', deleteError);
      return NextResponse.json({ error: 'Failed to leave channel' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Successfully left channel' });
  } catch (error) {
    console.error('Error in DELETE /api/channels/[id]/leave:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}