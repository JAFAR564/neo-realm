// test-db.js
// Script to test database connectivity and table structure

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('Testing database connectivity...');
  
  try {
    // Test if we can connect to the database
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to messages table:', error);
      return;
    }
    
    console.log('Successfully connected to messages table');
    console.log('Sample data:', data);
    
    // Check the structure of the messages table
    console.log('Checking messages table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('messages')
      .select('*')
      .limit(0);
    
    if (columnsError) {
      console.error('Error getting table structure:', columnsError);
    } else {
      console.log('Messages table structure:');
      if (columns.length === 0) {
        console.log('(Table is empty, but connection works)');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testDatabase();