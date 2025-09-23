// Architect Bot - Simple bot that sends periodic system messages
import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
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

serve(async (_req) => {
  try {
    console.log('Architect-bot function called');
    
    // Select a random message
    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    console.log('Selected message:', randomMessage);
    
    // Insert the message into the database as a system message
    // Using a null user_id since we might not have a valid user yet
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: null, // Allow null for system messages
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
});