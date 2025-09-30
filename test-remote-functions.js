// test-remote-functions.js


// Script to test invoking Supabase functions against the remote instance

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// We need the service role key for functions that need elevated permissions
// This would normally be kept secret and not in client-side code
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA1MzYyNywiZXhwIjoyMDczNjI5NjI3fQ.P4JN5keWXi6042X4bZz91vO1fL4j7P8q4b7q4b7q4b7'; // Placeholder - replace with actual key

async function testArchitectBot() {
  console.log('Testing architect-bot function...');
  
  try {
    // Try with a longer timeout
    const { data, error } = await supabase.functions.invoke('architect-bot', {
      timeout: 10000
    });
    
    if (error) {
      console.error('Error invoking architect-bot:', error.message);
      if (error.context && error.context.status) {
        console.error('Status code:', error.context.status);
      }
      if (error.context && error.context.statusText) {
        console.error('Status text:', error.context.statusText);
      }
      // Log the full error context for debugging
      console.error('Full error context:', JSON.stringify(error.context, null, 2));
      return;
    }
    
    console.log('architect-bot response:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function testWelcomeUser() {
  console.log('Testing welcome-user function...');
  
  try {
    // Note: This function expects a user record in the body
    const { data, error } = await supabase.functions.invoke('welcome-user', {
      body: { record: { username: 'testuser' } },
      timeout: 10000
    });
    
    if (error) {
      console.error('Error invoking welcome-user:', error.message);
      if (error.context && error.context.status) {
        console.error('Status code:', error.context.status);
      }
      if (error.context && error.context.statusText) {
        console.error('Status text:', error.context.statusText);
      }
      // Log the full error context for debugging
      console.error('Full error context:', JSON.stringify(error.context, null, 2));
      return;
    }
    
    console.log('welcome-user response:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function testSimpleFunction() {
  console.log('Testing test-function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-function');
    
    if (error) {
      console.error('Error invoking test-function:', error.message);
      if (error.context && error.context.status) {
        console.error('Status code:', error.context.status);
      }
      if (error.context && error.context.statusText) {
        console.error('Status text:', error.context.statusText);
      }
      return;
    }
    
    console.log('test-function response:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Check if we can access the database directly
async function testDatabaseAccess() {
  console.log('Testing direct database access...');
  
  try {
    // Try to fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error accessing messages table:', error.message);
      return;
    }
    
    console.log('Successfully accessed messages table. Found', data.length, 'messages');
    console.log('Sample messages:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run the tests
async function runTests() {
  console.log('=== Running Supabase Function Tests Against Remote Instance ===');
  await testSimpleFunction();
  console.log('---');
  await testDatabaseAccess();
  console.log('---');
  await testArchitectBot();
  console.log('---');
  await testWelcomeUser();
  console.log('=== Test Run Complete ===');
}

runTests();