// src/lib/middleware/loggingMiddleware.ts
import { NextRequest, NextFetchEvent } from 'next/server';
import { createLogger, logHttpRequest } from '@/lib/logger';

const logger = createLogger('middleware');

export async function loggingMiddleware(request: NextRequest, event: NextFetchEvent) {
  const startTime = Date.now();
  
  // Log the incoming request
  logger.info({
    type: 'http-incoming',
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip || request.headers.get('x-forwarded-for'),
  }, `Incoming ${request.method} request to ${request.url}`);

  // Create a response function to log the outgoing response
  const responseStartTime = Date.now();
  
  // Here you would typically call the next middleware or handler
  // For now, we'll just simulate the response timing
  const responseTime = Date.now() - responseStartTime;
  
  // Log the outgoing response (this would need to be called after the response is generated)
  // We'll export this function so it can be used in route handlers
  const logResponse = (statusCode: number) => {
    const totalTime = Date.now() - startTime;
    logHttpRequest(logger, request.method, request.url, statusCode, totalTime);
  };
  
  return { logResponse };
}