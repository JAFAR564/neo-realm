// create-user-and-profile.js
// Script to create a user and profile in the correct order

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFmb24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUserAndProfile() {
  console.log('Creating user and profile...');
  
  try {
    // Sign up a user using the auth API
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    });
    
    if (authError) {
      console.error('Error signing up user:', authError.message);
      return;
    }
    
    console.log('Successfully signed up user:', authData.user.id);
    
    // Wait a bit for the user to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now try to create a profile for this user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: `testuser${Date.now()}`,
        character_class: 'NetRunner',
        bio: 'A test user for NeoRealm'
      })
      .select();
    
    if (profileError) {
      console.error('Error creating profile:', profileError.message);
      return;
    }
    
    console.log('Successfully created profile:', profileData);
    
    // Create a test message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: authData.user.id,
        content: 'Welcome to NeoRealm! This is a test message.',
        message_type: 'chat'
      })
      .select();
    
    if (messageError) {
      console.error('Error creating test message:', messageError.message);
      return;
    }
    
    console.log('Successfully created test message:', messageData);
    
    console.log('User and profile creation complete!');
    return authData.user.id;
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createUserAndProfile();