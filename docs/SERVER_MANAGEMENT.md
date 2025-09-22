# Server Management and Log Persistence

This document explains the new server management and log persistence features added to the NeoRealm project.

## New Scripts

### 1. Kill Server Script
Terminates all NeoRealm development server processes.

**Usage:**
```bash
npm run kill-server
```

This script attempts to kill processes using multiple platform-specific commands:
- Windows: `taskkill` commands
- Unix/Linux/Mac: `pkill` commands

### 2. Error Monitor Script
Monitors the application logs for critical errors and automatically terminates the server if critical errors are detected.

**Usage:**
```bash
npm run error-monitor
```

**Features:**
- Monitors logs via the `/api/debug/logs` endpoint
- Detects critical error patterns (FATAL, CRITICAL, UNCAUGHT EXCEPTION, etc.)
- Automatically kills the server if 5 errors are detected or a critical error is found
- Provides detailed console output when errors are detected

### 3. Enhanced Development Script
Runs the development server with error monitoring.

**Usage:**
```bash
npm run dev:monitor
```

This runs both the Next.js development server and the error monitor in parallel.

## Log Persistence

### Persistent Log Storage
All application logs are now persisted to a file in addition to being stored in memory.

**Log File Location:**
```
neo-realm/logs/application.log
```

**Features:**
- Logs are written in JSON format for easy parsing
- Each log entry is on a separate line (newline-delimited JSON)
- Log file is created automatically if it doesn't exist
- In-memory storage is still limited to 1000 most recent entries
- File storage retains all logs (until manually cleared)

### Enhanced Log API
The debug logs API has been enhanced with new features:

**GET /api/debug/logs**
- Added `source` parameter: `memory` (default) or `file`
- Added `logFile` field in response showing the log file path

**DELETE /api/debug/logs**
- New endpoint to clear all logs (both memory and file storage)

## Environment Variables

### LOG_LEVEL
Control the verbosity of logs:
```bash
# In .env.local
LOG_LEVEL=debug  # trace, debug, info, warn, error, fatal
```

## Usage Examples

### 1. Development with Error Monitoring
```bash
npm run dev:monitor
```

### 2. Manual Log Inspection
```bash
# View recent logs in memory
curl "http://localhost:3000/api/debug/logs?limit=10"

# View recent logs from file
curl "http://localhost:3000/api/debug/logs?source=file&limit=10"

# View error-level logs
curl "http://localhost:3000/api/debug/logs?level=error"
```

### 3. Clear All Logs
```bash
curl -X DELETE http://localhost:3000/api/debug/logs
```

### 4. Kill Server Processes
```bash
npm run kill-server
```

## Log File Format

Each line in the log file is a JSON object with this structure:
```json
{
  "timestamp": "2023-05-15T10:30:45.123Z",
  "level": "info",
  "message": "User logged in successfully",
  "context": "auth",
  "userId": "user-123"
}
```

## Troubleshooting

### Server Won't Start (Port in Use)
If you see an "EADDRINUSE" error, kill the existing processes:
```bash
npm run kill-server
```

### Log File Growing Too Large
Manually clear logs:
```bash
curl -X DELETE http://localhost:3000/api/debug/logs
```

Or delete the log file directly:
```bash
rm neo-realm/logs/application.log
```