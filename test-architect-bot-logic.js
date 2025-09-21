// test-architect-bot-logic.js
// Script to test the logic of the architect-bot function locally

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with actual credentials
const supabaseUrl = 'https://hdcnitfvaeetutqqtjqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25pdGZ2YWVldHV0cXF0anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTM2MjcsImV4cCI6MjA3MzYyOTYyN30.MfOECxSqeqs-Ra-A8D9j5GRK-4cH6-nNzxJjtqL4gGQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// System messages that the Architect can send
const systemMessages = [
  "// WARNING: Dimensional stability at 98%. Fluctuations detected in the sector 7 data-stream.",
  "// NOTICE: Neural interface protocols updated. Please reboot your cyberdeck for optimal performance.",
  "// ALERT: Unusual activity detected in the Tokyo Node. All NetRunners proceed with caution.",
  "// SYSTEM: New firmware update available for all cybernetic implants. Visit the nearest clinic for installation.",
  "// INFO: The Corporation has opened new job contracts. Check the employment board for details.",
  "// MEMO: Maintenance window scheduled for 02:00-03:00 GMT. Temporary service disruptions may occur."
];

async function testArchitectBotLogic() {
  console.log('Testing architect-bot logic locally...');
  
  try {
    // Select a random message
    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    console.log('Selected message:', randomMessage);
    
    // Try to insert the message into the database as a system message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: null, // Allow null for system messages
        content: randomMessage,
        message_type: 'system'
      })
      .select();
    
    if (error) {
      console.error('Error inserting message:', error.message);
      return;
    }
    
    console.log('Message inserted successfully:', data);
    console.log('Architect-bot logic works correctly!');
  } catch (error) {
    console.error('Error in architect-bot logic:', error.message);
  }
}

testArchitectBotLogic();