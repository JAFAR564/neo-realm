// test-table-structure.js
// Script to check the structure of the messages table

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('Checking messages table structure...');
  
  try {
    // Try to get table information
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying messages table:', error);
      return;
    }
    
    console.log('Messages table is accessible');
    
    // Check if users table exists
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.log('Users table does not exist or is not accessible');
    } else {
      console.log('Users table exists and is accessible');
    }
    
    // Try to insert a test message with a fake user ID
    const { data: insertData, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        content: 'Test message',
        message_type: 'system'
      });
    
    if (insertError) {
      console.error('Error inserting test message:', insertError);
    } else {
      console.log('Successfully inserted test message');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkTableStructure();