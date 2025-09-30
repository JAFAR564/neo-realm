// setup-test-data.js
// Script to create test data for Supabase functions

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFmb24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTestData() {
  console.log('Setting up test data...');
  
  try {
    // Since we can't easily create users directly, let's create test messages
    // with null user_id values which we've confirmed works
    
    console.log('Creating test system messages...');
    
    // Create a few test messages
    const testMessages = [
      {
        user_id: null,
        content: '// TEST: System initialization complete. All systems nominal.',
        message_type: 'system'
      },
      {
        user_id: null,
        content: '// TEST: Welcome to NeoRealm testing environment.',
        message_type: 'system'
      }
    ];
    
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert(testMessages)
      .select();
    
    if (messageError) {
      console.error('Error creating test messages:', messageError.message);
      return false;
    }
    
    console.log('Successfully created test messages:', messageData.length);
    
    // Verify we can read the messages
    const { data: readData, error: readError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (readError) {
      console.error('Error reading test messages:', readError.message);
      return false;
    }
    
    console.log('Successfully read messages from database:');
    readData.forEach(msg => {
      console.log(`  - [${msg.message_type}] ${msg.content}`);
    });
    
    console.log('\n✅ Test data setup complete!');
    return true;
  } catch (err) {
    console.error('Error setting up test data:', err.message);
    return false;
  }
}

// Run the setup
setupTestData().then(success => {
  if (success) {
    console.log('Test data setup was successful.');
  } else {
    console.log('Test data setup failed.');
  }
});