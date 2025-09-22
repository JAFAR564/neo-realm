// check-channels.js
// Script to check if the General channel exists

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkChannels() {
  console.log('Checking channels...');
  
  try {
    // Try to access channels table with a different approach
    // Since we can't access the channels table directly, let's try to insert a message
    // and see what error we get
    
    console.log('1. Trying to insert a message without channel_id...');
    const { data: testData1, error: testError1 } = await supabase
      .from('messages')
      .insert({
        user_id: null,
        content: 'Test message without channel_id',
        message_type: 'system'
      });
    
    if (testError1) {
      console.log('Expected error when inserting without channel_id:', testError1.message);
    } else {
      console.log('Unexpectedly succeeded in inserting without channel_id:', testData1);
    }
    
    // Let's try to create a channel if it doesn't exist
    console.log('2. Checking if we can create a General channel...');
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .upsert({
        name: 'General',
        description: 'Main channel for all users',
        privacy: 'public'
      }, {
        onConflict: 'name'
      })
      .select();
    
    if (channelError) {
      console.error('Error creating/updating General channel:', channelError.message);
    } else {
      console.log('Successfully created/updated General channel:', channelData);
      if (channelData && channelData.length > 0) {
        console.log('General channel ID:', channelData[0].id);
        
        // Now try to insert a message with this channel_id
        console.log('3. Trying to insert a message with the channel_id...');
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            user_id: null,
            channel_id: channelData[0].id,
            content: 'Test message with channel_id',
            message_type: 'system'
          });
        
        if (messageError) {
          console.error('Error inserting message with channel_id:', messageError.message);
        } else {
          console.log('Successfully inserted message with channel_id:', messageData);
        }
      }
    }
  } catch (err) {
    console.error('Error in checkChannels:', err.message);
  }
}

// Run the check
checkChannels();