// check-messages-schema.js
// Script to check the actual schema of the messages table

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMessagesSchema() {
  console.log('Checking messages table schema...');
  
  try {
    // Try to get column information from the messages table
    console.log('1. Trying to get column info from messages table...');
    
    // Let's try a different approach - get a message and examine its structure
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError.message);
      return;
    }
    
    if (messages && messages.length > 0) {
      console.log('Sample message structure:');
      const message = messages[0];
      for (const key in message) {
        console.log(`  ${key}: ${typeof message[key]}`);
      }
    } else {
      console.log('No messages found');
    }
    
    // Let's also try to insert a message with a specific structure to see what happens
    console.log('2. Testing message insertion with various fields...');
    
    // Test 1: Insert with just required fields (as we think they should be)
    const testMessage1 = {
      content: 'Schema test message 1',
      message_type: 'system'
    };
    
    console.log('  Test 1 - Inserting with minimal fields:', testMessage1);
    const { data: testData1, error: testError1 } = await supabase
      .from('messages')
      .insert(testMessage1);
    
    if (testError1) {
      console.log('    Error:', testError1.message);
    } else {
      console.log('    Success');
    }
    
    // Test 2: Insert with user_id null
    const testMessage2 = {
      user_id: null,
      content: 'Schema test message 2',
      message_type: 'system'
    };
    
    console.log('  Test 2 - Inserting with user_id null:', testMessage2);
    const { data: testData2, error: testError2 } = await supabase
      .from('messages')
      .insert(testMessage2);
    
    if (testError2) {
      console.log('    Error:', testError2.message);
    } else {
      console.log('    Success');
    }
    
  } catch (err) {
    console.error('Error in checkMessagesSchema:', err.message);
  }
}

// Run the check
checkMessagesSchema();