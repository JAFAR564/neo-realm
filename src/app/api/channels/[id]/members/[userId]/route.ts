import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/serverSupabaseClient';

// PUT /api/channels/[id]/members/[userId] - Update a member's role (admin/moderator only)
export async function PUT(request: NextRequest, { params }: { params: { id: string, userId: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const channelId = params.id;
    const targetUserId = params.userId;
    const { role } = await request.json();
    
    // Validate role
    if (!['member', 'moderator', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Check if current user is admin or moderator of this channel
    const { data: currentUserMembership, error: currentUserError } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUserError || !currentUserMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const isAuthorized = currentUserMembership.role === 'admin' || 
                         (currentUserMembership.role === 'moderator' && role === 'member');
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if target user is a member of this channel
    const { data: targetUserMembership } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', targetUserId)
      .single();
    
    if (!targetUserMembership) {
      return NextResponse.json({ error: 'User is not a member of this channel' }, { status: 400 });
    }
    
    // Admins cannot change their own role
    if (targetUserId === session.user.id && targetUserMembership.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot change their own role' }, { status: 400 });
    }
    
    // Update the member's role
    const { data: updatedMembership, error: updateError } = await supabase
      .from('channel_memberships')
      .update({ role })
      .eq('channel_id', channelId)
      .eq('user_id', targetUserId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating member role:', updateError);
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
    }
    
    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error('Error in PUT /api/channels/[id]/members/[userId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/channels/[id]/members/[userId] - Remove a member from channel (admin/moderator only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string, userId: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServerSupabaseClient();
  
  try {
    const channelId = params.id;
    const targetUserId = params.userId;
    
    // Check if current user is admin or moderator of this channel
    const { data: currentUserMembership, error: currentUserError } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUserError || !currentUserMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const isAuthorized = currentUserMembership.role === 'admin' || currentUserMembership.role === 'moderator';
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if target user is a member of this channel
    const { data: targetUserMembership } = await supabase
      .from('channel_memberships')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', targetUserId)
      .single();
    
    if (!targetUserMembership) {
      return NextResponse.json({ error: 'User is not a member of this channel' }, { status: 400 });
    }
    
    // Admins cannot remove other admins
    if (targetUserMembership.role === 'admin') {
      return NextResponse.json({ error: 'Cannot remove admins from channel' }, { status: 400 });
    }
    
    // Admins and moderators cannot remove themselves
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from channel. Leave instead.' }, { status: 400 });
    }
    
    // Remove the member from the channel
    const { error: deleteError } = await supabase
      .from('channel_memberships')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', targetUserId);
    
    if (deleteError) {
      console.error('Error removing member:', deleteError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/channels/[id]/members/[userId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}