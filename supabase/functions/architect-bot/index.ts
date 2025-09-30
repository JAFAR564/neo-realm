// Architect Bot - Simple bot that sends periodic system messages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// System messages that the Architect can send
const systemMessages = [
  "// WARNING: Dimensional stability at 98%. Fluctuations detected in the sector 7 data-stream.",
  "// NOTICE: Neural interface protocols updated. Please reboot your cyberdeck for optimal performance.",
  "// ALERT: Unusual activity detected in the Tokyo Node. All NetRunners proceed with caution.",
  "// SYSTEM: New firmware update available for all cybernetic implants. Visit the nearest clinic for installation.",
  "// INFO: The Corporation has opened new job contracts. Check the employment board for details.",
  "// MEMO: Maintenance window scheduled for 02:00-03:00 GMT. Temporary service disruptions may occur."
];

export default async (_req: Request) => {
  try {
    console.log('Architect-bot function called');
    
    // Select a random message
    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    console.log('Selected message:', randomMessage);
    
    // Get the General channel ID to post the message to
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('name', 'General')
      .single();
    
    let channelId;
    if (channelError) {
      console.error('Error getting General channel:', channelError);
      // If General channel doesn't exist, try to create it
      const { data: createdChannel, error: createError } = await supabase
        .from('channels')
        .insert([
          { 
            name: 'General', 
            description: 'Main channel for all users', 
            privacy: 'public' 
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating General channel:', createError);
        // Fallback: attempt to insert message without channel if channels table doesn't exist
        const { data, error: fallbackError } = await supabase
          .from('messages')
          .insert({
            user_id: null, // Allow null for system messages
            content: randomMessage,
            message_type: 'system'
          })
          .select();
        
        if (fallbackError) {
          console.error('Fallback message insert also failed:', fallbackError);
          return new Response(JSON.stringify({ error: fallbackError.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
          });
        }
        
        console.log('Message inserted using fallback (no channel):', data);
        return new Response(JSON.stringify({ message: "System message sent successfully (fallback mode)" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Add creator as admin member to the new channel
      const { error: membershipError } = await supabase
        .from('channel_memberships')
        .insert([
          {
            channel_id: createdChannel.id,
            user_id: createdChannel.creator_id,
            role: 'admin'
          }
        ]);
      
      if (membershipError) {
        console.error('Error adding creator to General channel:', membershipError);
        // Continue anyway, as the channel was created
      }
      
      channelId = createdChannel.id;
    } else {
      channelId = channel.id;
    }
    
    // Insert the message into the database as a system message
    // Using a null user_id since we might not have a valid user yet
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: null, // Allow null for system messages
        channel_id: channelId,
        content: randomMessage,
        message_type: 'system'
      })
      .select();
    
    if (error) {
      console.error('Error inserting message:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log('Message inserted successfully:', data);
    
    return new Response(JSON.stringify({ message: "System message sent successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in architect-bot function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};