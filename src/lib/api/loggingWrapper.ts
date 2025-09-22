// src/lib/api/loggingWrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { createLogger, logHttpRequest, logError } from '@/lib/logger';

// Type for our API route handlers
type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

// Create a wrapper function that adds logging to API route handlers
export function withLogging(handler: RouteHandler, contextName: string) {
  const logger = createLogger(`api:${contextName}`);
  
  return async function wrappedHandler(request: NextRequest) {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    
    // Log the incoming request
    logger.info({
      type: 'api-request',
      method,
      url,
    }, `API ${method} request to ${url}`);
    
    try {
      // Call the actual handler
      const response = await handler(request);
      
      // Log the successful response
      const responseTime = Date.now() - startTime;
      logHttpRequest(logger, method, url, response.status, responseTime);
      
      return response;
    } catch (error: any) {
      // Log the error
      const responseTime = Date.now() - startTime;
      logError(logger, error, {
        type: 'api-error',
        method,
        url,
      });
      
      // Log the error response
      logHttpRequest(logger, method, url, 500, responseTime);
      
      // Return a generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}