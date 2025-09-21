// check-profiles-structure.js
// Script to check the structure of the profiles table

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfilesStructure() {
  console.log('Checking profiles table structure...');
  
  try {
    // Get all columns from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error querying profiles table:', error.message);
    } else {
      console.log('Profiles table structure:');
      if (data.length > 0) {
        console.log('Sample row:', data[0]);
        console.log('Column names:', Object.keys(data[0]));
      } else {
        console.log('Profiles table is empty');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkProfilesStructure();