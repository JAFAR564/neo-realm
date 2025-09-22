// src/lib/persistentLogStorage.ts
// Enhanced log storage that persists logs to a file

import fs from 'fs';
import path from 'path';

class PersistentLogStorage {
  private logs: any[] = [];
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
            return JSON.parse(line);
          } catch (e) {
            // If parsing fails, create a log entry with the raw line
            return {
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `Failed to parse log line: ${line}`,
              rawLine: line
            };
          }
        });
        
        console.log(`Loaded ${this.logs.length} existing log entries from file`);
      }
    } catch (error) {
      console.error('Error loading logs from file:', error);
    }
  }

  private writeLogToFile(logEntry: any) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFilePath, logLine, 'utf8');
    } catch (error) {
      console.error('Error writing log to file:', error);
    }
  }

  addLog(logEntry: any) {
    // Add timestamp if not present
    const logWithTimestamp = {
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
    } catch (error) {
      console.error('Error clearing log file:', error);
    }
  }

  getLogCount() {
    return this.logs.length;
  }

  getLogFilePath() {
    return this.logFilePath;
  }

  // Get logs from file (for cases where we need more than what's in memory)
  getAllLogsFromFile() {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const fileContent = fs.readFileSync(this.logFilePath, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        return lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return {
              timestamp: new Date().toISOString(),
              level: 'error',
              message: `Failed to parse log line: ${line}`,
              rawLine: line
            };
          }
        }).reverse(); // Return in chronological order (oldest first)
      }
    } catch (error) {
      console.error('Error reading logs from file:', error);
    }
    
    return [];
  }
}

// Export a singleton instance
export const persistentLogStorage = new PersistentLogStorage();