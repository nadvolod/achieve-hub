#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');

console.log('🚀 Starting Daily Dreamer test runner...');

// Start the dev server
console.log('📦 Starting development server...');
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true
});

let serverReady = false;

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Local:') || output.includes('localhost:5173')) {
    console.log('✅ Development server is ready!');
    serverReady = true;
    runTests();
  }
});

devServer.stderr.on('data', (data) => {
  console.error('Dev server error:', data.toString());
});

// Wait for server to start, then run tests
function runTests() {
  if (!serverReady) {
    setTimeout(runTests, 1000);
    return;
  }

  console.log('🧪 Running Playwright tests...');
  
  const testProcess = spawn('npx', ['playwright', 'test', '--project=chromium'], {
    stdio: 'inherit'
  });

  testProcess.on('close', (code) => {
    console.log(`\n📊 Tests completed with code: ${code}`);
    
    // Kill the dev server
    process.kill(-devServer.pid);
    
    if (code === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed. Check the output above.');
      console.log('📄 View detailed report: npx playwright show-report');
    }
    
    process.exit(code);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down...');
  if (devServer.pid) {
    process.kill(-devServer.pid);
  }
  process.exit(0);
});

// Timeout after 5 minutes
setTimeout(() => {
  console.log('⏰ Timeout waiting for server to start');
  if (devServer.pid) {
    process.kill(-devServer.pid);
  }
  process.exit(1);
}, 300000); 