// check-table-structure.js
// Script to check the structure of all tables

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('=== Checking Table Structures ===');
  
  try {
    // Check profiles table
    console.log('\n--- Profiles Table ---');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('Error querying profiles table:', profilesError.message);
    } else {
      console.log('Profiles table accessible');
      if (profilesData.length > 0) {
        console.log('Sample row:', profilesData[0]);
      } else {
        console.log('Profiles table is empty');
      }
    }
    
    // Check messages table
    console.log('\n--- Messages Table ---');
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.log('Error querying messages table:', messagesError.message);
    } else {
      console.log('Messages table accessible');
      if (messagesData.length > 0) {
        console.log('Sample row:', messagesData[0]);
      } else {
        console.log('Messages table is empty');
      }
    }
    
    // Try to insert a test message with null user_id
    console.log('\n--- Testing Message Insertion ---');
    const { data: insertData, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: null,
        content: 'Test message with null user_id',
        message_type: 'system'
      })
      .select();
    
    if (insertError) {
      console.log('Error inserting test message:', insertError.message);
    } else {
      console.log('Successfully inserted test message:', insertData);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTableStructure();