import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/serverSupabaseClient';

// GET /api/channels/[id] - Retrieve details for a specific channel
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const channelId = params.id;
    
    // Get the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select(`
        *,
        profiles!channels_creator_id_fkey(username)
      `)
      .eq('id', channelId)
      .single();
    
    if (channelError) {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Check if user has access to this channel
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
    
    // Get member count
    const { count: memberCount } = await supabase
      .from('channel_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId);
    
    // Check if current user is a member
    const { data: userMembership } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    const channelWithDetails = {
      ...channel,
      member_count: memberCount || 0,
      is_member: !!userMembership,
      user_role: userMembership?.role || null
    };
    
    return NextResponse.json(channelWithDetails);
  } catch (error) {
    console.error('Error in GET /api/channels/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/channels/[id] - Update a channel's details
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const channelId = params.id;
    const { name, description, privacy } = await request.json();
    
    // Check if user is admin of this channel
    const { data: membership, error: membershipError } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    if (membershipError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Validate input
    if (name && name.trim().length === 0) {
      return NextResponse.json({ error: 'Channel name cannot be empty' }, { status: 400 });
    }
    
    if (name && name.length > 50) {
      return NextResponse.json({ error: 'Channel name must be 50 characters or less' }, { status: 400 });
    }
    
    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Channel description must be 500 characters or less' }, { status: 400 });
    }
    
    // Update the channel
    const { data: updatedChannel, error: updateError } = await supabase
      .from('channels')
      .update({
        name: name ? name.trim() : undefined,
        description: description ? description.trim() : undefined,
        privacy: privacy || undefined
      })
      .eq('id', channelId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating channel:', updateError);
      return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
    }
    
    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error('Error in PUT /api/channels/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/channels/[id] - Delete a channel
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const channelId = params.id;
    
    // Check if user is admin of this channel
    const { data: membership, error: membershipError } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    if (membershipError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Delete the channel (this will cascade delete memberships due to foreign key constraint)
    const { error: deleteError } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (deleteError) {
      console.error('Error deleting channel:', deleteError);
      return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/channels/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}