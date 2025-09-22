// src/lib/logger.ts
import pino from 'pino';
import { logStorage } from './logStorage';
import { persistentLogStorage } from './persistentLogStorage';

// Create a logger instance with a custom transport
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  },
  // Add context to all log messages
  base: {
    service: 'neo-realm',
    version: '1.0.0',
  },
});

// Create a proxy logger that also stores logs in our storage
const createProxyLogger = (baseLogger: pino.Logger) => {
  return new Proxy(baseLogger, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(prop)) {
        return (...args: any[]) => {
          // Store the log in our storage
          const level = prop;
          const message = args[args.length - 1];
          const context = args.length > 1 ? args[0] : {};
          
          const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            ...context
          };
          
          logStorage.addLog(logEntry);
          persistentLogStorage.addLog(logEntry);
          
          // Call the original method
          return target[prop](...args);
        };
      }
      
      return Reflect.get(target, prop, receiver);
    }
  });
};

// Export the proxy logger
const proxyLogger = createProxyLogger(logger);

// Create a structured logger with context
export const createLogger = (context: string) => {
  const childLogger = proxyLogger.child({ context });
  return createProxyLogger(childLogger);
};

// Export the main logger
export default proxyLogger;

// Log levels for reference
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Utility function to log HTTP requests
export const logHttpRequest = (
  logger: pino.Logger,
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
  logger: pino.Logger,
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
  logger: pino.Logger,
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
  logger: pino.Logger,
  error: Error,
  context?: Record<string, any>
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