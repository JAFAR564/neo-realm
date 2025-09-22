// check-schema.js
// Script to check what tables we can access

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking available tables...');
  
  try {
    // List all tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error fetching table list:', error.message);
      return;
    }
    
    console.log('Available tables in public schema:');
    data.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Try to access each table we know should exist
    const tablesToCheck = ['profiles', 'channels', 'messages', 'followers', 'reactions', 'channel_memberships'];
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`\nChecking access to ${tableName}...`);
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('count()');
        
        if (tableError) {
          console.error(`Error accessing ${tableName}:`, tableError.message);
        } else {
          console.log(`Successfully accessed ${tableName}`);
        }
      } catch (err) {
        console.error(`Exception when accessing ${tableName}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error in checkSchema:', err.message);
  }
}

// Run the check
checkSchema();