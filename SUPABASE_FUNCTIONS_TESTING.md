# Supabase Functions Testing Guide

This guide explains how to test the Supabase functions for NeoRealm and provides workarounds for common issues.

## Overview

NeoRealm uses three Supabase functions:
1. `test-function` - A simple test function to verify basic functionality
2. `architect-bot` - Sends periodic system messages to the chat
3. `welcome-user` - Sends welcome messages to new users

## Testing Functions Locally

### 1. Using the Test Script

Run the test script to invoke all functions:

```bash
node neo-realm/test-functions.js
```

This will show the results of each function call.

### 2. Testing Individual Functions

You can also test individual functions:

```javascript
// Test the test-function
const { data, error } = await supabase.functions.invoke('test-function');

// Test the architect-bot
const { data, error } = await supabase.functions.invoke('architect-bot');

// Test the welcome-user function
const { data, error } = await supabase.functions.invoke('welcome-user', {
  body: { record: { username: 'testuser' } }
});
```

## Common Issues and Workarounds

### Issue 1: Functions Return 500 Errors

**Symptoms**: Functions fail with "Edge Function returned a non-2xx status code" and status 500.

**Root Cause**: This is often due to deployment issues or missing environment variables.

**Workaround**:
1. Verify function logic locally using the test scripts:
   ```bash
   node neo-realm/test-architect-bot-logic.js
   node neo-realm/test-welcome-user-logic.js
   ```

2. Check that the database schema allows the operations your functions are trying to perform.

### Issue 2: Database Constraint Violations

**Symptoms**: Functions fail when trying to insert data that violates foreign key constraints.

**Root Cause**: Missing related records in parent tables.

**Workaround**:
1. Modify functions to handle cases where related records might not exist.
2. Use null values where appropriate (we've already implemented this for user_id in messages).

### Issue 3: Supabase CLI Deployment Failures

**Symptoms**: `supabase functions deploy` fails with Docker or network errors.

**Root Cause**: Network connectivity issues or Docker configuration problems.

**Workaround**:
1. Test function logic locally using direct database operations.
2. Verify the code works as expected before attempting deployment.
3. Try deploying functions one at a time:
   ```bash
   npx supabase functions deploy test-function
   npx supabase functions deploy architect-bot
   npx supabase functions deploy welcome-user
   ```

## Testing Database Operations

### Checking Table Structure

```bash
node neo-realm/check-table-structure.js
```

### Setting Up Test Data

```bash
node neo-realm/setup-test-data.js
```

Note: This requires the service role key for full functionality.

## Function Logic Verification

We've created local test scripts that verify the function logic works correctly:

1. `test-architect-bot-logic.js` - Tests the architect-bot message generation and insertion
2. `test-welcome-user-logic.js` - Tests the welcome-user message generation and insertion
3. `comprehensive-test.js` - Runs all tests in sequence

Run the comprehensive test:
```bash
node neo-realm/comprehensive-test.js
```

## Best Practices

1. **Always test function logic locally** before deploying
2. **Handle null values** appropriately in database operations
3. **Use proper error handling** in functions to provide meaningful error messages
4. **Test with various input scenarios** including edge cases
5. **Verify database constraints** match your function expectations

## Troubleshooting Checklist

- [ ] Verify Supabase credentials are correct
- [ ] Check that all required database tables exist
- [ ] Verify table relationships and constraints
- [ ] Test function logic locally before deployment
- [ ] Check Supabase function logs for detailed error information
- [ ] Ensure Docker is running if using local Supabase development
- [ ] Try deploying functions individually if bulk deployment fails