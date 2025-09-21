// test-welcome-user-logic.js
// Script to test the logic of the welcome-user function locally

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWelcomeUserLogic() {
  console.log('Testing welcome-user logic locally...');
  
  try {
    // Simulate the user data that would be passed to the function
    const record = { username: 'testuser' };
    
    // Create a welcome message from the Architect
    const welcomeMessage = `A new signal detected. The Architect acknowledges you, ${record.username}. Your story begins now.`;
    console.log('Generated welcome message:', welcomeMessage);
    
    // Insert the welcome message into the database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: null, // Allow null for system messages
        content: welcomeMessage,
        message_type: 'system'
      })
      .select();
    
    if (error) {
      console.error('Error inserting welcome message:', error.message);
      return;
    }
    
    console.log('Welcome message inserted successfully:', data);
    console.log('Welcome-user logic works correctly!');
  } catch (error) {
    console.error('Error in welcome-user logic:', error.message);
  }
}

testWelcomeUserLogic();