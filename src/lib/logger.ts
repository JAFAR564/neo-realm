// src/lib/logger.ts
import pino from 'pino';

// Create a logger instance
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

// Create a structured logger with context
export const createLogger = (context: string) => {
  return logger.child({ context });
};

// Export the main logger
export default logger;

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
  logger.info({
    type: 'http',
    method,
    url,
    statusCode,
    responseTime,
    userId,
  }, `${method} ${url} ${statusCode} ${responseTime}ms`);
};

// Utility function to log database operations
export const logDatabaseOperation = (
  logger: pino.Logger,
  operation: string,
  table: string,
  recordId?: string | number,
  userId?: string
) => {
  logger.debug({
    type: 'database',
    operation,
    table,
    recordId,
    userId,
  }, `DB ${operation} on ${table}${recordId ? ` with ID ${recordId}` : ''}`);
};

// Utility function to log authentication events
export const logAuthEvent = (
  logger: pino.Logger,
  event: string,
  userId?: string,
  email?: string,
  error?: string
) => {
  logger.info({
    type: 'auth',
    event,
    userId,
    email,
    error,
  }, `Auth ${event}${userId ? ` for user ${userId}` : ''}${error ? ` - Error: ${error}` : ''}`);
};

// Utility function to log errors with context
export const logError = (
  logger: pino.Logger,
  error: Error,
  context?: Record<string, any>
) => {
  logger.error({
    err: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, `Error: ${error.message}`);
};