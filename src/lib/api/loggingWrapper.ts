// src/lib/api/loggingWrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { createLogger, logHttpRequest, logError } from '@/lib/logger';

// Type for our API route handlers
type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

// Create a wrapper function that adds logging to API route handlers
export function withLogging(handler: RouteHandler, contextName: string) {
  return async function wrappedHandler(request: NextRequest) {
    let logger;
    try {
      logger = createLogger(`api:${contextName}`);
    } catch (loggerError) {
      console.error('Error creating logger:', loggerError);
      // Fallback logger using console
      logger = {
        info: console.info,
        error: console.error,
        warn: console.warn,
        debug: console.debug,
      };
    }
    
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    
    try {
      // Log the incoming request
      logger.info({
        type: 'api-request',
        method,
        url,
      }, `API ${method} request to ${url}`);
    } catch (logError) {
      console.error('Error logging request:', logError);
    }
    
    try {
      // Call the actual handler
      const response = await handler(request);
      
      // Log the successful response
      const responseTime = Date.now() - startTime;
      
      try {
        logHttpRequest(logger, method, url, response.status, responseTime);
      } catch (logError) {
        console.error('Error logging HTTP request:', logError);
      }
      
      return response;
    } catch (error: Error) {
      // Log the error
      const responseTime = Date.now() - startTime;
      
      try {
        logError(logger, error, {
          type: 'api-error',
          method,
          url,
        });
      } catch (logError) {
        console.error('Error logging API error:', logError);
      }
      
      try {
        // Log the error response
        logHttpRequest(logger, method, url, 500, responseTime);
      } catch (logError) {
        console.error('Error logging HTTP error request:', logError);
      }
      
      // Return a generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}