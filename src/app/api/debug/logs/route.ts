// src/app/api/debug/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api/loggingWrapper';
import { logStorage } from '@/lib/logStorage';
import { createLogger } from '@/lib/logger';

const logger = createLogger('api:debug-logs');

// GET /api/debug/logs - Retrieve recent logs
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level') || undefined;
    const context = searchParams.get('context') || undefined;
    
    logger.info({ 
      action: 'fetch-logs',
      limit,
      level,
      context
    }, 'Fetching debug logs');
    
    const logs = logStorage.getLogs(limit, level || undefined, context || undefined);
    
    logger.info({ 
      action: 'logs-fetched',
      count: logs.length
    }, `Successfully fetched ${logs.length} logs`);
    
    return NextResponse.json({
      logs,
      total: logs.length,
    });
  } catch (error: any) {
    logger.error({ 
      action: 'fetch-logs-error',
      error: error.message
    }, 'Error fetching debug logs');
    
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// POST /api/debug/logs - Add a log entry (for testing)
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, context } = body;
    
    if (!message) {
      logger.warn({ action: 'missing-message' }, 'Message is required');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Add the log to our storage
    logStorage.addLog({
      timestamp: new Date().toISOString(),
      level: level || 'info',
      message,
      ...context
    });
    
    logger.info({ 
      action: 'log-added',
      level,
      message
    }, 'Log entry added via API');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error({ 
      action: 'add-log-error',
      error: error.message
    }, 'Error adding log entry');
    
    return NextResponse.json(
      { error: 'Failed to add log entry' },
      { status: 500 }
    );
  }
}

// Export the wrapped handlers
export { 
  withLogging(GET, 'debug-logs') as GET,
  withLogging(POST, 'debug-logs') as POST
};