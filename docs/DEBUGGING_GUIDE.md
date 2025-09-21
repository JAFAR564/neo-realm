# Debugging Guide

## Overview

This guide explains how to effectively debug the NeoRealm application using the built-in logging system and debugging tools.

## Logging System

The application uses a structured logging system based on Pino. Logs are output in JSON format in production and formatted text in development.

### Log Levels

- **fatal**: Critical errors that cause the application to shut down
- **error**: Errors that affect functionality
- **warn**: Warnings that should be investigated
- **info**: General information about application state
- **debug**: Detailed information for debugging
- **trace**: Very detailed information for tracing execution

### Viewing Logs

#### Development Environment

In development, logs are automatically displayed in the terminal where you run `npm run dev`.

#### Production Environment

In production, logs are output as structured JSON. You can:

1. View logs in your hosting platform's log viewer (Vercel, Heroku, etc.)
2. Pipe logs to a file: `npm start > app.log 2>&1`
3. Use a log management service like Logstash, Fluentd, or Datadog

### Log Structure

Each log entry includes:
- Timestamp
- Log level
- Service name and version
- Context (component or module)
- Message
- Additional structured data

Example:
```
[2023-01-01 12:00:00.123] INFO (neo-realm/1234 on hostname): User logged in
    context: "auth"
    userId: "user123"
    ip: "192.168.1.1"
```

## Debug Log Viewer

In development mode, a debug log viewer is available in the browser:

1. Look for the "Show Logs" button in the bottom-right corner of the page
2. Click it to open the log viewer panel
3. Use the filter input to search for specific logs
4. Logs are automatically updated in real-time

## Debugging API Routes

API routes are automatically wrapped with logging middleware that captures:

- Incoming requests (method, URL, headers)
- Outgoing responses (status code, response time)
- Errors with full stack traces

To view API logs:
1. Check the terminal output when running in development
2. Look for entries with `context: "api:*"`

## Debugging Database Operations

Database operations are logged with:
- Operation type (SELECT, INSERT, UPDATE, DELETE)
- Table name
- Record ID (when applicable)
- User ID (when applicable)

## Debugging Authentication

Authentication events are logged with:
- Event type (login, logout, signup, etc.)
- User ID
- Email (when available)
- Error messages (when applicable)

## Common Debugging Scenarios

### User Cannot Log In

1. Check auth logs for "login" events
2. Look for error messages or warnings
3. Verify the user exists in the database
4. Check if the password is correct

### User Cannot Create Channel

1. Check API logs for "/api/channels" POST requests
2. Look for validation errors
3. Verify the user is authenticated
4. Check database logs for INSERT operations

### Messages Not Appearing

1. Check API logs for "/api/messages" GET requests
2. Verify the user has access to the channel
3. Check database logs for SELECT operations
4. Check real-time subscription logs

### Performance Issues

1. Check API logs for slow response times
2. Look for database query logs with long execution times
3. Check for memory or CPU usage warnings

## Environment Variables for Debugging

- `LOG_LEVEL`: Set to 'debug' or 'trace' for more detailed logging
- `NODE_ENV`: Set to 'development' to enable debug features

Example `.env.local` for debugging:
```
LOG_LEVEL=debug
NODE_ENV=development
```

## Using Console.log (Not Recommended)

While you can still use `console.log`, it's recommended to use the structured logger instead:

```typescript
// Instead of:
console.log('User logged in', userId);

// Use:
logger.info({ userId }, 'User logged in');
```

This provides:
- Consistent formatting
- Structured data
- Proper log levels
- Context information

## Error Tracking

The application automatically logs all errors with:
- Full stack traces
- Context information
- Request details (for API errors)

To debug an error:
1. Find the error log entry
2. Look at the stack trace
3. Check the context and additional data
4. Reproduce the issue if possible

## Performance Monitoring

Response times are automatically logged for all API requests:
- Check for requests taking longer than expected
- Look for patterns (e.g., all requests to a specific endpoint are slow)
- Monitor for sudden changes in performance

## Testing Logging

To test the logging system:

1. Temporarily add log statements in your code:
   ```typescript
   logger.debug({ test: 'value' }, 'Testing logging');
   ```

2. Verify the logs appear in the output

3. Test different log levels:
   ```typescript
   logger.trace('Trace message');
   logger.debug('Debug message');
   logger.info('Info message');
   logger.warn('Warn message');
   logger.error('Error message');
   ```

## Best Practices

1. **Use structured logging**: Include relevant data as objects rather than string concatenation
2. **Log at appropriate levels**: Don't log everything at INFO level
3. **Include context**: Always include relevant context like userId, channelId, etc.
4. **Avoid sensitive data**: Never log passwords, tokens, or personal information
5. **Log entry and exit points**: Log when entering and exiting important functions
6. **Log errors with context**: Include relevant data when logging errors
7. **Use consistent naming**: Use consistent field names across log entries

## Troubleshooting Logging Issues

If logs aren't appearing:

1. Check the LOG_LEVEL environment variable
2. Verify you're using the correct logger instance
3. Ensure the logging code is actually being executed
4. Check for any error handling that might be suppressing logs
5. Verify the application is running in the expected environment