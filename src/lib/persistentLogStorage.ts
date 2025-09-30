// src/lib/persistentLogStorage.ts
// Enhanced log storage that persists logs to a file

import fs from 'fs';
import path from 'path';
import { LogLevel } from './logger';

type LogEntry = {
  timestamp?: string;
  level: LogLevel;
  message: string;
  context?: string;
  [key: string]: unknown;
};

class PersistentLogStorage {
  private logs: LogEntry[] = [];
  private maxSize: number = 1000;
  private logFilePath: string;

  constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Set log file path
    this.logFilePath = path.join(logsDir, 'application.log');
    
    // Load existing logs from file if it exists
    this.loadLogsFromFile();
  }

  private loadLogsFromFile() {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const fileContent = fs.readFileSync(this.logFilePath, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        // Parse each line as JSON and add to logs array
        this.logs = lines.map(line => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch (e: unknown) {
            // If parsing fails, create a log entry with the raw line
            const error = e as Error;
            return {
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `Failed to parse log line: ${line}. Error: ${error.message}`,
              rawLine: line
            };
          }
        });
        
        console.log(`Loaded ${this.logs.length} existing log entries from file`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error loading logs from file:', err.message);
    }
  }

  private writeLogToFile(logEntry: LogEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFilePath, logLine, 'utf8');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error writing log to file:', err.message);
    }
  }

  addLog(logEntry: LogEntry) {
    // Add timestamp if not present
    const logWithTimestamp: LogEntry = {
      timestamp: new Date().toISOString(),
      ...logEntry
    };

    // Add to the beginning of the array
    this.logs.unshift(logWithTimestamp);

    // Write to file
    this.writeLogToFile(logWithTimestamp);

    // Keep only the most recent logs in memory
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
    try {
      fs.writeFileSync(this.logFilePath, '', 'utf8');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error clearing log file:', err.message);
    }
  }

  getLogCount() {
    return this.logs.length;
  }

  getLogFilePath() {
    return this.logFilePath;
  }

  // Get logs from file (for cases where we need more than what's in memory)
  getAllLogsFromFile(): LogEntry[] {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const fileContent = fs.readFileSync(this.logFilePath, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        return lines.map(line => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch (e: unknown) {
            const error = e as Error;
            return {
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `Failed to parse log line: ${line}. Error: ${error.message}`,
              rawLine: line
            };
          }
        }).reverse(); // Return in chronological order (oldest first)
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error reading logs from file:', err.message);
    }
    
    return [];
  }
}

// Export a singleton instance
export const persistentLogStorage = new PersistentLogStorage();