// src/lib/logger.ts
import { logStorage } from './logStorage';
import { persistentLogStorage } from './persistentLogStorage';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface Logger {
  trace: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  fatal: (...args: unknown[]) => void;
}

// Create a simple logger that stores logs in our storage without using pino 
// This completely avoids thread issues
export const createLogger = (context: string): Logger => {
  const logger = {
    trace: (...args: unknown[]) => {
      logToStorages('trace', args, { context });
      console.log('[TRACE]', `[${context}]`, ...args);
    },
    debug: (...args: unknown[]) => {
      logToStorages('debug', args, { context });
      console.log('[DEBUG]', `[${context}]`, ...args);
    },
    info: (...args: unknown[]) => {
      logToStorages('info', args, { context });
      console.info('[INFO]', `[${context}]`, ...args);
    },
    warn: (...args: unknown[]) => {
      logToStorages('warn', args, { context });
      console.warn('[WARN]', `[${context}]`, ...args);
    },
    error: (...args: unknown[]) => {
      logToStorages('error', args, { context });
      console.error('[ERROR]', `[${context}]`, ...args);
    },
    fatal: (...args: unknown[]) => {
      logToStorages('fatal', args, { context });
      console.error('[FATAL]', `[${context}]`, ...args);
    },
  };

  return logger;
};

// Helper function to store logs to both in-memory and persistent storage
const logToStorages = (level: string, args: unknown[], bindings?: Record<string, unknown>) => {
  try {
    const message = args[args.length - 1];
    const context = args.length > 1 ? args[0] : {};
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...context as Record<string, unknown>,
      ...bindings
    };
    
    // Safely add log to storage with error handling
    try {
      logStorage.addLog(logEntry);
    } catch (storageError) {
      console.error('Error adding log to in-memory storage:', storageError);
    }
    
    try {
      persistentLogStorage.addLog(logEntry);
    } catch (persistentStorageError) {
      console.error('Error adding log to persistent storage:', persistentStorageError);
    }
  } catch (logError) {
    console.error('Error creating log entry:', logError);
  }
};

// Create a default logger instance
const defaultLogger = createLogger('default');

// Export a default logger
export default defaultLogger;

// Utility function to log HTTP requests
export const logHttpRequest = (
  logger: Logger, // Using any to handle our enhanced logger
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  userId?: string
) => {
  const logEntry = {
    type: 'http',
    method,
    url,
    statusCode,
    responseTime,
    userId,
  };
  
  logger.info(logEntry, `${method} ${url} ${statusCode} ${responseTime}ms`);
};

// Utility function to log database operations
export const logDatabaseOperation = (
  logger: Logger, // Using any to handle our enhanced logger
  operation: string,
  table: string,
  recordId?: string | number,
  userId?: string
) => {
  const logEntry = {
    type: 'database',
    operation,
    table,
    recordId,
    userId,
  };
  
  logger.debug(logEntry, `DB ${operation} on ${table}${recordId ? ` with ID ${recordId}` : ''}`);
};

// Utility function to log authentication events
export const logAuthEvent = (
  logger: Logger, // Using any to handle our enhanced logger
  event: string,
  userId?: string,
  email?: string,
  error?: string
) => {
  const logEntry = {
    type: 'auth',
    event,
    userId,
    email,
    error,
  };
  
  logger.info(logEntry, `Auth ${event}${userId ? ` for user ${userId}` : ''}${error ? ` - Error: ${error}` : ''}`);
};

// Utility function to log errors with context
export const logError = (
  logger: Logger, // Using any to handle our enhanced logger
  error: Error,
  context?: Record<string, unknown>
) => {
  const logEntry = {
    err: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  };
  
  logger.error(logEntry, `Error: ${error.message}`);
};