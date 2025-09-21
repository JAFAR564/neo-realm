// verify-message-reading.js
// Script to verify we can read messages from the database

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyMessageReading() {
  console.log('Verifying message reading from database...');
  
  try {
    // Read recent messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error reading messages:', error.message);
      return;
    }
    
    console.log(`Successfully read ${messages.length} messages:`);
    
    if (messages.length === 0) {
      console.log('No messages found in the database.');
      return;
    }
    
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.created_at}] [${msg.message_type}] ${msg.content}`);
      if (msg.user_id) {
        console.log(`   User ID: ${msg.user_id}`);
      } else {
        console.log('   System message (no user)');
      }
    });
    
    console.log('\n✅ Message reading verified successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

verifyMessageReading();