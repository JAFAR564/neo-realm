// src/lib/logStorage.ts
// Simple in-memory log storage for development
// In production, you would use a proper logging service or database

type LogEntry = {
  timestamp?: string;
  level: string;
  message: string;
  context?: string;
  [key: string]: unknown;
};

class LogStorage {
  private logs: LogEntry[] = [];
  private maxSize: number = 1000;

  addLog(logEntry: LogEntry) {
    // Add timestamp if not present
    const logWithTimestamp: LogEntry = {
      timestamp: new Date().toISOString(),
      ...logEntry
    };

    // Add to the beginning of the array
    this.logs.unshift(logWithTimestamp);

    // Keep only the most recent logs
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(0, this.maxSize);
    }
  }

  getLogs(limit: number = 50, level?: string, context?: string) {
    let filteredLogs = this.logs;

    // Filter by level if specified
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Filter by context if specified
    if (context) {
      filteredLogs = filteredLogs.filter(log => log.context && log.context.includes(context));
    }

    return filteredLogs.slice(0, limit);
  }

  clearLogs() {
    this.logs = [];
  }

  getLogCount() {
    return this.logs.length;
  }
}

// Export a singleton instance
export const logStorage = new LogStorage();