// debug-functions.js
// Script to debug Supabase functions by testing them step by step

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
// Use the anon key for regular access
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugArchitectBot() {
  console.log('Debugging architect-bot function...');
  
  try {
    // First, let's check if we can access the messages table directly
    console.log('1. Testing direct database access...');
    const { data: tableData, error: tableError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing messages table:', tableError.message);
      return;
    }
    
    console.log('Successfully accessed messages table');
    
    // Check channels first
    console.log('2. Checking channels...');
    const { data: channels, error: channelError } = await supabase
      .from('channels')
      .select('*');
    
    if (channelError) {
      console.error('Error fetching channels:', channelError.message);
      return;
    }
    
    console.log('Channels found:', channels.length);
    if (channels.length > 0) {
      console.log('First channel:', JSON.stringify(channels[0], null, 2));
      
      // Now let's try to insert a message directly
      console.log('3. Testing direct message insertion...');
      const { data: insertData, error: insertError } = await supabase
        .from('messages')
        .insert({
          user_id: null,
          channel_id: channels[0].id,  // Use the first channel's ID
          content: 'Debug test message',
          message_type: 'system'
        })
        .select();
      
      if (insertError) {
        console.error('Error inserting message directly:', insertError.message);
        return;
      }
      
      console.log('Successfully inserted message directly:', insertData);
    }
    
    // Now let's try to invoke the function
    console.log('4. Testing function invocation...');
    const { data: functionData, error: functionError } = await supabase.functions.invoke('architect-bot', {
      timeout: 10000
    });
    
    if (functionError) {
      console.error('Error invoking architect-bot:', functionError.message);
      if (functionError.context && functionError.context.status) {
        console.error('Status code:', functionError.context.status);
      }
      if (functionError.context && functionError.context.statusText) {
        console.error('Status text:', functionError.context.statusText);
      }
      return;
    }
    
    console.log('architect-bot response:', functionData);
  } catch (err) {
    console.error('Error in debugArchitectBot:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

// Run the debug
debugArchitectBot();