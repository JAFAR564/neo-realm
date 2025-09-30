// scripts/watch-logs.js
// Script to watch and display logs from the debug API

import https from 'https';
import http from 'http';

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const INTERVAL = 5000; // 5 seconds

console.log('=== NeoRealm Log Watcher ===');
console.log(`Watching logs from http://${HOST}:${PORT}/api/debug/logs`);
console.log('Press Ctrl+C to stop\n');

let lastLogCount = 0;

// Function to fetch logs from the API
function fetchLogs() {
  const url = `http://${HOST}:${PORT}/api/debug/logs?limit=10`;
  
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
          
          // Only display logs if we have new ones
          if (logs.length > lastLogCount) {
            console.log('\n--- New Logs ---');
            logs.slice(0, logs.length - lastLogCount).reverse().forEach(log => {
              const timestamp = new Date(log.timestamp).toLocaleTimeString();
              const level = (log.level || 'INFO').toUpperCase().padEnd(7);
              console.log(`[${timestamp}] ${level} ${log.message}`);
              
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
              
              console.log('');
            });
            console.log('----------------\n');
            
            lastLogCount = logs.length;
          }
        } else {
          console.error('Received non-JSON response:');
          console.error('Status:', res.statusCode);
          console.error('Content-Type:', res.headers['content-type']);
          console.error('Response body (first 500 chars):', data.substring(0, 500));
        }
      } catch (error) {
        console.error('Error parsing log data:', error.message);
        console.error('Response data:', data.substring(0, 500));
      }
    });
  }).on('error', (error) => {
    // Only show connection errors every 5th attempt to avoid spam
    if (fetchLogs.attempt % 5 === 0) {
      console.error(`Error fetching logs: ${error.message}`);
      console.error('Make sure the development server is running on port 3000\n');
    }
    fetchLogs.attempt = (fetchLogs.attempt || 0) + 1;
  });
}

// Start watching logs
console.log('Starting log watcher...');
fetchLogs(); // Initial fetch
setInterval(fetchLogs, INTERVAL);