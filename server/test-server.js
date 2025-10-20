import https from 'https';

/**
 * Simple test script for the HTTPS server
 * Tests all endpoints and validates responses
 */

const SERVER_HOST = 'localhost';
const SERVER_PORT = 5050;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let passedTests = 0;
let failedTests = 0;

/**
 * Make HTTPS request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: path,
      method: method,
      rejectUnauthorized: false, // Accept self-signed certificates
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test helper
 */
function test(name, fn) {
  return fn()
    .then(() => {
      console.log(`${colors.green}✓${colors.reset} ${name}`);
      passedTests++;
    })
    .catch((error) => {
      console.log(`${colors.red}✗${colors.reset} ${name}`);
      console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
      failedTests++;
    });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n' + colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  console.log(colors.blue + '  HTTPS Server Test Suite' + colors.reset);
  console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset + '\n');

  // Test 1: Server Status
  await test('GET /status - Server health check', async () => {
    const response = await makeRequest('GET', '/status');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (response.data.status !== 'online') {
      throw new Error('Server status is not online');
    }
  });

  // Test 2: Send valid weight data
  await test('POST /weight - Send valid weight data', async () => {
    const response = await makeRequest('POST', '/weight', { weight: 12.34 });
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.success) {
      throw new Error('Response success is false');
    }
  });

  // Test 3: Send invalid weight data (no weight field)
  await test('POST /weight - Reject invalid data (missing weight)', async () => {
    const response = await makeRequest('POST', '/weight', { value: 12.34 });
    if (response.statusCode !== 400) {
      throw new Error(`Expected status 400, got ${response.statusCode}`);
    }
  });

  // Test 4: Send invalid weight data (NaN)
  await test('POST /weight - Reject invalid data (NaN)', async () => {
    const response = await makeRequest('POST', '/weight', { weight: 'invalid' });
    if (response.statusCode !== 400) {
      throw new Error(`Expected status 400, got ${response.statusCode}`);
    }
  });

  // Test 5: Send out of range weight
  await test('POST /weight - Reject out of range weight', async () => {
    const response = await makeRequest('POST', '/weight', { weight: 9999 });
    if (response.statusCode !== 400) {
      throw new Error(`Expected status 400, got ${response.statusCode}`);
    }
  });

  // Test 6: Get logs
  await test('GET /logs - Retrieve weight logs', async () => {
    const response = await makeRequest('GET', '/logs?limit=10');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.success) {
      throw new Error('Response success is false');
    }
    if (!Array.isArray(response.data.data)) {
      throw new Error('Response data is not an array');
    }
  });

  // Test 7: Get statistics
  await test('GET /stats - Get weight statistics', async () => {
    const response = await makeRequest('GET', '/stats');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.success) {
      throw new Error('Response success is false');
    }
    if (!response.data.stats) {
      throw new Error('Response missing stats object');
    }
  });

  // Test 8: Get log files
  await test('GET /log-files - List log files', async () => {
    const response = await makeRequest('GET', '/log-files');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.success) {
      throw new Error('Response success is false');
    }
  });

  // Test 9: 404 for invalid endpoint
  await test('GET /invalid - Return 404 for invalid endpoint', async () => {
    const response = await makeRequest('GET', '/invalid');
    if (response.statusCode !== 404) {
      throw new Error(`Expected status 404, got ${response.statusCode}`);
    }
  });

  // Test 10: Multiple weight submissions
  await test('POST /weight - Handle multiple submissions', async () => {
    const weights = [10.5, 15.2, 20.8, 5.3, 12.1];
    for (const weight of weights) {
      const response = await makeRequest('POST', '/weight', { weight });
      if (response.statusCode !== 200) {
        throw new Error(`Failed to submit weight ${weight}`);
      }
    }
  });

  // Print summary
  console.log('\n' + colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  console.log(colors.blue + '  Test Summary' + colors.reset);
  console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`  Total:  ${passedTests + failedTests}`);
  console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset + '\n');

  if (failedTests > 0) {
    console.log(colors.red + '❌ Some tests failed!' + colors.reset + '\n');
    process.exit(1);
  } else {
    console.log(colors.green + '✅ All tests passed!' + colors.reset + '\n');
    process.exit(0);
  }
}

// Check if server is running
console.log(`\n${colors.yellow}Checking if server is running on https://${SERVER_HOST}:${SERVER_PORT}...${colors.reset}\n`);

makeRequest('GET', '/status')
  .then(() => {
    console.log(`${colors.green}✓ Server is running!${colors.reset}\n`);
    runTests();
  })
  .catch((error) => {
    console.log(`${colors.red}✗ Cannot connect to server!${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}\n`);
    console.log(`${colors.yellow}Make sure the server is running:${colors.reset}`);
    console.log(`  cd server`);
    console.log(`  npm start\n`);
    process.exit(1);
  });

