# Testing Supabase Functions

This document explains how to test the deployed Supabase functions.

## Prerequisites

1. Ensure you have the Supabase project credentials in your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Install the required dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

## Testing with the Test Script

Run the provided test script:

```bash
node test-functions.js
```

## Manual Testing with cURL

You can also test the functions manually using cURL:

### Testing architect-bot

```bash
curl -X GET 'https://hdcnitfvaeetutqqtjqc.functions.supabase.co/architect-bot' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Testing welcome-user

```bash
curl -X POST 'https://hdcnitfvaeetutqqtjqc.functions.supabase.co/welcome-user' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"record": {"username": "testuser"}}'
```

Replace `YOUR_ANON_KEY` with your actual Supabase anon key.

## Testing in the Browser

You can also test the functions directly in your browser's developer console:

```javascript
// Initialize Supabase client
const { createClient } = supabase;
const _supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

// Test architect-bot
const { data, error } = await _supabase.functions.invoke('architect-bot');
console.log(data, error);

// Test welcome-user
const { data: welcomeData, error: welcomeError } = await _supabase.functions.invoke('welcome-user', {
  body: { record: { username: 'testuser' } }
});
console.log(welcomeData, welcomeError);
```

## Setting Up Automated Triggers

For production use, you might want to set up automated triggers:

1. **architect-bot**: Can be triggered by a cron job or scheduled task
2. **welcome-user**: Should be triggered by database events (new user signup)

In the Supabase dashboard:
1. Go to "Database" → "Triggers"
2. Create a trigger for the `welcome-user` function on the `profiles` table
3. Set it to trigger on INSERT events
```