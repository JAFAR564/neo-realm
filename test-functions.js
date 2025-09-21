// test-functions.js
// Script to test invoking Supabase functions with better error handling

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Run the tests
async function runTests() {
  console.log('=== Running Supabase Function Tests ===');
  await testSimpleFunction();
  console.log('---');
  await testArchitectBot();
  console.log('---');
  await testWelcomeUser();
  console.log('=== Test Run Complete ===');
}

runTests();