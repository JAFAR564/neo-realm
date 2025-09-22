// src/app/api/debug/logs/route.ts
// Force recompilation by adding a comment
// Fixing export syntax and type definitions
import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api/loggingWrapper';
import { logStorage } from '@/lib/logStorage';
import { persistentLogStorage } from '@/lib/persistentLogStorage';
import { createLogger } from '@/lib/logger';

const logger = createLogger('api:debug-logs');

// GET /api/debug/logs - Retrieve recent logs
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level') || undefined;
    const context = searchParams.get('context') || undefined;
    const source = searchParams.get('source') || 'memory'; // 'memory' or 'file'
    
    logger.info({ 
      action: 'fetch-logs',
      limit,
      level,
      context,
      source
    }, 'Fetching debug logs');
    
    let logs;
    if (source === 'file') {
      // Get logs from persistent storage file
      const allLogs = persistentLogStorage.getAllLogsFromFile();
      // Apply filters
      let filteredLogs = allLogs;
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }
      if (context) {
        filteredLogs = filteredLogs.filter(log => log.context && log.context.includes(context));
      }
      logs = filteredLogs.slice(-limit).reverse(); // Get most recent logs
    } else {
      // Get logs from memory (default behavior)
      logs = logStorage.getLogs(limit, level || undefined, context || undefined);
    }
    
    logger.info({ 
      action: 'logs-fetched',
      count: logs.length,
      source
    }, `Successfully fetched ${logs.length} logs from ${source}`);
    
    return NextResponse.json({
      logs,
      total: logs.length,
      logFile: persistentLogStorage.getLogFilePath()
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
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level || 'info',
      message,
      ...context
    };
    
    logStorage.addLog(logEntry);
    persistentLogStorage.addLog(logEntry);
    
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

// DELETE /api/debug/logs - Clear all logs
async function DELETE(request: NextRequest) {
  try {
    logger.info({ action: 'clear-logs' }, 'Clearing all logs');
    
    logStorage.clearLogs();
    persistentLogStorage.clearLogs();
    
    logger.info({ action: 'logs-cleared' }, 'Successfully cleared all logs');
    
    return NextResponse.json({ success: true, message: 'Logs cleared successfully' });
  } catch (error: any) {
    logger.error({ 
      action: 'clear-logs-error',
      error: error.message
    }, 'Error clearing logs');
    
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}

// Export the wrapped handlers
const getHandler = withLogging(GET, 'debug-logs');
const postHandler = withLogging(POST, 'debug-logs');
const deleteHandler = withLogging(DELETE, 'debug-logs');

export { getHandler as GET, postHandler as POST, deleteHandler as DELETE };