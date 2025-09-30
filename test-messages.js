// test-messages.js
// Script to test message insertion and understand the schema

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMessages() {
  console.log('Testing message operations...');
  
  try {
    // First, let's get some existing messages to understand the structure
    console.log('1. Fetching existing messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(3);
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError.message);
      return;
    }
    
    console.log('Found messages:', messages.length);
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, JSON.stringify(msg, null, 2));
    });
    
    // Now let's see if we can determine what channel_id to use
    // Check if there's a channel_id in the existing messages
    if (messages.length > 0 && messages[0].channel_id) {
      console.log('2. Found channel_id in existing messages:', messages[0].channel_id);
      
      // Try to insert a new message with the same channel_id
      console.log('3. Testing message insertion with existing channel_id...');
      const { data: insertData, error: insertError } = await supabase
        .from('messages')
        .insert({
          user_id: null,
          channel_id: messages[0].channel_id,
          content: 'Test message from debug script',
          message_type: 'system'
        })
        .select();
      
      if (insertError) {
        console.error('Error inserting message:', insertError.message);
        return;
      }
      
      console.log('Successfully inserted message:', insertData);
    } else {
      console.log('2. No channel_id found in existing messages');
    }
  } catch (err) {
    console.error('Error in testMessages:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

// Run the test
testMessages();