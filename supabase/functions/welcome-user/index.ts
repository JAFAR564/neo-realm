// Welcome new users to the realm
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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

serve(async (req) => {
  try {
    console.log('Welcome-user function called');
    
    // Get the user data from the request
    const { record } = await req.json();
    console.log('Received record:', record);
    
    // Create a welcome message from the Architect
    const welcomeMessage = `A new signal detected. The Architect acknowledges you, ${record.username || 'traveler'}. Your story begins now.`;
    console.log('Generated welcome message:', welcomeMessage);
    
    // Insert the welcome message into the database
    // Using a null user_id since we might not have a valid user yet
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: null, // Allow null for system messages
        content: welcomeMessage,
        message_type: 'system'
      })
      .select();
    
    if (error) {
      console.error('Error inserting welcome message:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log('Welcome message inserted successfully:', data);
    
    return new Response(JSON.stringify({ message: "Welcome message sent successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in welcome-user function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});