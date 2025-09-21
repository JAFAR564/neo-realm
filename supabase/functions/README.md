# Supabase Functions

This directory contains the serverless functions for the NeoRealm project.

## Functions

### architect-bot

A simple bot that sends periodic system messages to the chat. It selects a random message from a predefined list and inserts it into the messages table as a system message.

- **Entry point**: `index.ts`
- **HTTP Method**: GET
- **Invocation**: Can be triggered manually or via a cron job

### welcome-user

A function that sends a welcome message to new users when they sign up. It's triggered by a database event (when a new user record is created).

- **Entry point**: `index.ts`
- **HTTP Method**: POST
- **Invocation**: Triggered by database events

## Deployment

To deploy these functions, use the Supabase CLI:

```bash
supabase functions deploy
```

Or use the provided deployment scripts:
- On Windows: Run `supabase-deploy.bat`
- On macOS/Linux: Run `supabase-deploy.sh`

## Function Configuration

The `config.json` file defines the configuration for each function, including:
- Function name
- Entrypoint file
- HTTP methods allowed

## Testing Functions Locally

You can test functions locally using the Supabase CLI:

```bash
# Start the local Supabase stack
supabase start

# Serve functions locally
supabase functions serve

# Test a function with curl
curl -X GET 'http://localhost:54321/functions/v1/architect-bot' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json"
```

Note: The local testing requires Docker to be running.