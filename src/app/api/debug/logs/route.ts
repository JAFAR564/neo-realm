// src/app/api/debug/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api/loggingWrapper';

// In a real implementation, you would store logs in a database or file
// For now, we'll use an in-memory array (this will reset on server restart)
let logs: any[] = [];

// Middleware to capture logs (in a real implementation, you'd use the logger)
const captureLog = (level: string, message: string, context?: any) => {
  logs.unshift({
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  });
  
  // Keep only the last 100 logs
  if (logs.length > 100) {
    logs = logs.slice(0, 100);
  }
};

// Mock the logger to capture logs
const mockLogger = {
  info: (message: string, context?: any) => captureLog('info', message, context),
  warn: (message: string, context?: any) => captureLog('warn', message, context),
  error: (message: string, context?: any) => captureLog('error', message, context),
};

// GET /api/debug/logs - Retrieve recent logs
async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const level = searchParams.get('level');
  
  mockLogger.info('Fetching debug logs', { limit, level });
  
  let filteredLogs = logs;
  
  if (level) {
    filteredLogs = logs.filter(log => log.level === level);
  }
  
  return NextResponse.json({
    logs: filteredLogs.slice(0, limit),
    total: filteredLogs.length,
  });
}

// POST /api/debug/logs - Add a log entry (for testing)
async function POST(request: NextRequest) {
  const body = await request.json();
  const { level, message, context } = body;
  
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  
  captureLog(level || 'info', message, context);
  
  return NextResponse.json({ success: true });
}

// Export the wrapped handlers
export { 
  withLogging(GET, 'debug-logs') as GET,
  withLogging(POST, 'debug-logs') as POST
};