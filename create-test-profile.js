// create-test-profile.js
// Script to create a test profile and then insert a message

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestProfileAndMessage() {
  console.log('Creating test profile...');
  
  // Generate a UUID for the test profile
  const testUserId = uuidv4();
  console.log('Test user ID:', testUserId);
  
  try {
    // Create a test profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        username: 'testuser',
        // Add other required fields as needed
      })
      .select();
    
    if (profileError) {
      console.error('Error creating test profile:', profileError);
      return;
    }
    
    console.log('Successfully created test profile:', profileData);
    
    // Now try to insert a message with this user ID
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: testUserId,
        content: 'Test message from test profile',
        message_type: 'system'
      })
      .select();
    
    if (messageError) {
      console.error('Error inserting test message:', messageError);
    } else {
      console.log('Successfully inserted test message:', messageData);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

createTestProfileAndMessage();