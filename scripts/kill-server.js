// scripts/kill-server.js
// Script to kill the NeoRealm development server and related processes

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

async function killProcesses() {
  console.log('Attempting to kill NeoRealm development processes...');
  
  // Array of commands to try for different platforms
  const killCommands = [
    // Windows commands
    'taskkill /F /IM node.exe /FI "WINDOWTITLE eq *next dev*"',
    'taskkill /F /IM node.exe /FI "WINDOWTITLE eq *neo-realm*"',
    
    // Unix/Linux/Mac commands
    "pkill -f 'next dev'",
    "pkill -f 'neo-realm'",
    "pkill -f 'node.*next'",
    
    // Cross-platform approach using ps and kill
    "ps aux | grep 'next dev' | grep -v grep | awk '{print $2}' | xargs kill -9",
    "ps aux | grep 'neo-realm' | grep -v grep | awk '{print $2}' | xargs kill -9"
  ];
  
  let success = false;
  
  for (const command of killCommands) {
    try {
      console.log(`Trying: ${command}`);
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
      console.log(`Error: ${error.message}`);
    }
  }
  
  if (success) {
    console.log('\n✅ Server processes terminated successfully!');
  } else {
    console.log('\n⚠️  No processes were terminated. The server may not be running.');
  }
  
  console.log('\nIf the server is still running, try manually finding and killing the process:');
  console.log('- On Windows: Use Task Manager to find and end Node.js processes');
  console.log('- On Mac/Linux: Use "ps aux | grep next" to find the process ID, then "kill -9 [PID]"');
}

// Run the kill function
killProcesses().catch(error => {
  console.error('Error occurred while trying to kill processes:', error);
});