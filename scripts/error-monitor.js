// scripts/error-monitor.js
// Script to monitor logs for errors and automatically kill the server if critical errors are detected

import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const INTERVAL = 5000; // 5 seconds
const ERROR_THRESHOLD = 5; // Number of errors before taking action
const CRITICAL_ERROR_PATTERNS = [
  'FATAL',
  'fatal',
  'CRITICAL',
  'critical',
  'UNCAUGHT EXCEPTION',
  'uncaughtException',
  'UNHANDLED REJECTION',
  'unhandledRejection',
  'process.exit',
  'EADDRINUSE', // Port already in use
  'ENOMEM', // Out of memory
  'SIGSEGV', // Segmentation fault
  'SIGABRT' // Abort signal
];

let errorCount = 0;
let lastLogTimestamp = null;

console.log('=== NeoRealm Error Monitor ===');
console.log(`Monitoring logs from http://${HOST}:${PORT}/api/debug/logs`);
console.log('Press Ctrl+C to stop\n');

// Function to check if a log entry contains critical error patterns
function isCriticalError(logEntry) {
  const message = logEntry.message || '';
  const level = logEntry.level || '';
  
  // Check if the log level is error or fatal
  if (['error', 'fatal'].includes(level.toLowerCase())) {
    return true;
  }
  
  // Check for critical error patterns in the message
  return CRITICAL_ERROR_PATTERNS.some(pattern => 
    message.includes(pattern)
  );
}

// Function to kill the server processes
async function killServer() {
  console.log('🚨 CRITICAL ERROR DETECTED - Killing server processes...');
  
  // Array of commands to try for different platforms
  const killCommands = [
    // Windows commands
    'taskkill /F /IM node.exe /FI "WINDOWTITLE eq *next dev*"',
    'taskkill /F /IM node.exe /FI "WINDOWTITLE eq *neo-realm*"',
    
    // Unix/Linux/Mac commands
    "pkill -f 'next dev'",
    "pkill -f 'neo-realm'",
    "pkill -f 'node.*next'"
  ];
  
  let success = false;
  
  for (const command of killCommands) {
    try {
      console.log(`Executing: ${command}`);
      const result = await execPromise(command);
      console.log(`Command output: ${result.stdout || 'No output'}`);
      if (result.stderr) {
        console.log(`Command stderr: ${result.stderr}`);
      }
      success = true;
      console.log(`Successfully executed: ${command}`);
      // If one command works, we don't need to try the others
      break;
    } catch (error) {
      // Some commands will fail on certain platforms, which is expected
      console.log(`Command failed (expected on some platforms): ${command}`);
    }
  }
  
  if (success) {
    console.log('\n✅ Server processes terminated successfully due to critical errors!');
    console.log('Please check the logs and fix the issues before restarting.');
  } else {
    console.log('\n⚠️  Failed to kill server processes. Please terminate manually.');
  }
  
  process.exit(1); // Exit with error code
}

// Function to fetch logs from the API
function fetchLogs() {
  const url = `http://${HOST}:${PORT}/api/debug/logs?limit=20`;
  
  // Choose the right HTTP client based on the URL
  const client = url.startsWith('https') ? https : http;
  
  client.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        // Check if the response is JSON
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          const response = JSON.parse(data);
          const logs = response.logs || [];
          
          // Process logs to check for errors
          let newErrorCount = 0;
          let criticalErrorDetected = false;
          
          logs.forEach(log => {
            // Skip logs that were processed in previous iterations
            if (lastLogTimestamp && log.timestamp <= lastLogTimestamp) {
              return;
            }
            
            if (isCriticalError(log)) {
              newErrorCount++;
              criticalErrorDetected = true;
              console.log(`🚨 CRITICAL ERROR DETECTED: [${log.timestamp}] ${log.level?.toUpperCase()} ${log.message}`);
              
              // Display additional context if available
              if (log.context) {
                console.log(`           Context: ${log.context}`);
              }
              
              // Display other properties
              Object.keys(log).forEach(key => {
                if (!['timestamp', 'level', 'message', 'context'].includes(key)) {
                  console.log(`           ${key}: ${JSON.stringify(log[key])}`);
                }
              });
            }
          });
          
          // Update last log timestamp
          if (logs.length > 0) {
            lastLogTimestamp = logs[0].timestamp;
          }
          
          // Update error count
          errorCount += newErrorCount;
          
          // Take action if critical error detected or error threshold exceeded
          if (criticalErrorDetected || errorCount >= ERROR_THRESHOLD) {
            console.log(`\n🚨 ERROR THRESHOLD REACHED: ${errorCount} errors detected`);
            killServer();
            return;
          }
          
          // Display status if there are new errors
          if (newErrorCount > 0) {
            console.log(`\n⚠️  ${newErrorCount} new error(s) detected. Total error count: ${errorCount}/${ERROR_THRESHOLD}`);
          }
        } else {
          // Only show this error occasionally to avoid spam
          if (fetchLogs.attempt % 10 === 0) {
            console.error('Received non-JSON response from log API:');
            console.error('Status:', res.statusCode);
            console.error('Content-Type:', res.headers['content-type']);
          }
        }
      } catch (error) {
        // Only show this error occasionally to avoid spam
        if (fetchLogs.attempt % 10 === 0) {
          console.error('Error parsing log data:', error.message);
        }
      }
    });
  }).on('error', (error) => {
    // Only show connection errors occasionally to avoid spam
    if (fetchLogs.attempt % 10 === 0) {
      console.error(`Error connecting to log API: ${error.message}`);
      console.error('Make sure the development server is running on port 3000\n');
    }
    fetchLogs.attempt = (fetchLogs.attempt || 0) + 1;
  });
}

// Add a method to track attempts
fetchLogs.attempt = 0;

// Start monitoring logs
console.log('Starting error monitor...');
fetchLogs(); // Initial fetch
setInterval(fetchLogs, INTERVAL);