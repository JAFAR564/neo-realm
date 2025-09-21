# Logging System Documentation

## Overview

The NeoRealm logging system is built on top of Pino, a fast and lightweight logging library for Node.js. It provides structured, contextual logging with multiple log levels and various utility functions for common logging scenarios.

## Features

1. **Structured Logging**: All logs are output in structured JSON format for easy parsing and analysis
2. **Contextual Logging**: Each log entry includes contextual information like service name, version, and component
3. **Multiple Log Levels**: Support for fatal, error, warn, info, debug, and trace levels
4. **Pretty Printing**: Development-friendly formatted output with colors and timestamps
5. **Specialized Loggers**: Utility functions for HTTP requests, database operations, authentication events, and errors
6. **API Route Wrapping**: Middleware to automatically log API requests and responses

## Setup

The logging system is automatically configured through `src/lib/logger.ts`. The log level can be controlled through the `LOG_LEVEL` environment variable.

## Usage

### Basic Logging

```typescript
import logger, { createLogger } from '@/lib/logger';

// Use the default logger
logger.info('Application started');

// Create a contextual logger
const userLogger = createLogger('user-service');
userLogger.info('User service initialized');
```

### Log Levels

```typescript
logger.fatal('Critical error that will shut down the application');
logger.error('Error that needs immediate attention');
logger.warn('Warning that should be investigated');
logger.info('General information about application state');
logger.debug('Detailed information for debugging');
logger.trace('Very detailed information for tracing execution');
```

### HTTP Request Logging

```typescript
import { logHttpRequest } from '@/lib/logger';

logHttpRequest(logger, 'GET', '/api/users', 200, 45);
// Output: GET /api/users 200 45ms
```

### Database Operation Logging

```typescript
import { logDatabaseOperation } from '@/lib/logger';

logDatabaseOperation(logger, 'INSERT', 'users', '12345', 'user123');
// Output: DB INSERT on users with ID 12345
```

### Authentication Event Logging

```typescript
import { logAuthEvent } from '@/lib/logger';

logAuthEvent(logger, 'login_success', 'user123', 'user@example.com');
// Output: Auth login_success for user user123
```

### Error Logging

```typescript
import { logError } from '@/lib/logger';

try {
  // Some operation that might fail
} catch (error) {
  logError(logger, error, { operation: 'user-fetch', userId: '123' });
}
```

### API Route Logging

```typescript
import { withLogging } from '@/lib/api/loggingWrapper';

async function GET(request: NextRequest) {
  // Your route handler logic
}

async function POST(request: NextRequest) {
  // Your route handler logic
}

// Export wrapped handlers
export { 
  withLogging(GET, 'users') as GET,
  withLogging(POST, 'users') as POST
};
```

## Configuration

The logging system can be configured through environment variables:

- `LOG_LEVEL`: Set the minimum log level to output (default: 'info')
  - Valid values: 'fatal', 'error', 'warn', 'info', 'debug', 'trace'

## Best Practices

1. **Use Appropriate Log Levels**: 
   - Use `error` for unexpected issues that affect functionality
   - Use `warn` for expected issues that should be investigated
   - Use `info` for general application state changes
   - Use `debug` for detailed information useful for debugging

2. **Include Context**: Always include relevant context in log messages:
   ```typescript
   logger.info({ userId: '123', action: 'profile-update' }, 'User updated profile');
   ```

3. **Avoid Sensitive Data**: Never log passwords, tokens, or other sensitive information

4. **Use Structured Data**: Prefer structured logging over string concatenation:
   ```typescript
   // Good
   logger.info({ userId: user.id, operation: 'login' }, 'User logged in');
   
   // Avoid
   logger.info(`User ${user.id} logged in`);
   ```

5. **Log at Entry and Exit Points**: Log when entering and exiting important functions:
   ```typescript
   function processUser(user) {
     logger.debug({ userId: user.id }, 'Processing user');
     
     // Processing logic
     
     logger.debug({ userId: user.id }, 'Finished processing user');
   }
   ```

## Log Output

In development, logs are formatted with colors and timestamps for easy reading:

```
[2023-01-01 12:00:00.123] INFO (neo-realm/1234 on hostname): Application started
    context: "main"
```

In production, logs are output as structured JSON for easy parsing by log management systems:

```json
{"level":30,"time":1672536000123,"pid":1234,"hostname":"hostname","service":"neo-realm","version":"1.0.0","context":"main","msg":"Application started"}
```

## Troubleshooting

If you're not seeing expected log output:

1. Check the `LOG_LEVEL` environment variable
2. Verify that you're using the correct logger instance
3. Ensure that the logging code is actually being executed
4. Check for any error handling that might be suppressing logs