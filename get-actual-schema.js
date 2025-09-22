// get-actual-schema.js
// Script to try to get the actual schema of the messages table

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getActualSchema() {
  console.log('Attempting to get actual schema...');
  
  try {
    // Try to use Supabase's RPC to get table info
    console.log('1. Trying to get table info via RPC...');
    
    // This might not work, but let's try
    const { data, error } = await supabase.rpc('get_table_info', {
      table_name: 'messages'
    });
    
    if (error) {
      console.log('Error with RPC call:', error.message);
    } else {
      console.log('RPC result:', data);
    }
    
    // Let's try to insert a record with various fields to see what's allowed
    console.log('2. Testing field validation...');
    
    // Test with a field we know doesn't exist
    const testMessage = {
      content: 'Schema test',
      message_type: 'system',
      definitely_not_a_real_field: 'test'
    };
    
    console.log('  Testing insert with invalid field...');
    const { error: insertError } = await supabase
      .from('messages')
      .insert(testMessage);
    
    if (insertError) {
      console.log('    Error (expected):', insertError.message);
    } else {
      console.log('    Unexpectedly succeeded - field was ignored');
    }
    
  } catch (err) {
    console.error('Error in getActualSchema:', err.message);
  }
}

// Run the function
getActualSchema();