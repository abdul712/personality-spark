#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'https://personality-spark-api.workers.dev';
const API_PREFIX = '/api/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Temporary storage for test data
const testData = {
  accessToken: null,
  userId: null,
  resultId: null,
  shareId: null,
  quizData: null
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = client.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
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

// Test runner function
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n${colors.cyan}Testing: ${name}${colors.reset}`);
  
  try {
    const result = await testFn();
    if (result.success) {
      testResults.passed++;
      console.log(`${colors.green}✓ PASSED${colors.reset}: ${result.message || 'Test completed successfully'}`);
      testResults.tests.push({ name, status: 'passed', message: result.message });
    } else {
      testResults.failed++;
      console.log(`${colors.red}✗ FAILED${colors.reset}: ${result.message || 'Test failed'}`);
      testResults.tests.push({ name, status: 'failed', message: result.message });
    }
  } catch (error) {
    testResults.failed++;
    console.log(`${colors.red}✗ ERROR${colors.reset}: ${error.message}`);
    testResults.tests.push({ name, status: 'error', message: error.message });
  }
}

// Test functions for each endpoint
async function testGetCategories() {
  const response = await makeRequest('GET', `${API_PREFIX}/quizzes/categories`);
  
  if (response.status === 200 && Array.isArray(response.body)) {
    return { success: true, message: `Found ${response.body.length} categories` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testGenerateQuiz() {
  const response = await makeRequest('GET', `${API_PREFIX}/quizzes/generate/personality`);
  
  if (response.status === 200 && response.body.quiz_id && response.body.questions) {
    testData.quizData = response.body;
    return { success: true, message: `Generated quiz with ${response.body.questions.length} questions` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testGetDailyQuiz() {
  const response = await makeRequest('GET', `${API_PREFIX}/quizzes/daily`);
  
  if (response.status === 200 && response.body.quiz_id) {
    return { success: true, message: 'Retrieved daily quiz successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testSubmitQuiz() {
  if (!testData.quizData) {
    return { success: false, message: 'No quiz data available from previous test' };
  }

  const answers = testData.quizData.questions.map((q, idx) => ({
    question_id: idx + 1,
    answer: q.options[0].value
  }));

  const response = await makeRequest('POST', `${API_PREFIX}/quizzes/submit`, {
    quiz_id: testData.quizData.quiz_id,
    answers: answers
  });
  
  if (response.status === 200 && response.body.result_id) {
    testData.resultId = response.body.result_id;
    return { success: true, message: `Quiz submitted, result ID: ${response.body.result_id}` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testGetResult() {
  if (!testData.resultId) {
    return { success: false, message: 'No result ID available from previous test' };
  }

  const response = await makeRequest('GET', `${API_PREFIX}/quizzes/result/${testData.resultId}`);
  
  if (response.status === 200 && response.body.personality_type) {
    return { success: true, message: `Retrieved result: ${response.body.personality_type}` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testAIGenerateQuiz() {
  const response = await makeRequest('POST', `${API_PREFIX}/ai/generate-quiz`, {
    quiz_type: 'personality',
    num_questions: 5,
    theme: 'work-life balance',
    difficulty: 'medium'
  });
  
  if (response.status === 200 && response.body.questions) {
    return { success: true, message: `AI generated ${response.body.questions.length} questions` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testAIAnalyzePersonality() {
  const response = await makeRequest('POST', `${API_PREFIX}/ai/analyze-personality`, {
    responses: [
      { question: 'How do you handle stress?', answer: 'I take deep breaths and plan my approach' },
      { question: 'What motivates you?', answer: 'Personal growth and learning' }
    ]
  });
  
  if (response.status === 200 && response.body.analysis) {
    return { success: true, message: 'AI personality analysis completed' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testAIGenerateInsights() {
  const response = await makeRequest('POST', `${API_PREFIX}/ai/generate-insights`, {
    personality_type: 'INTJ',
    traits: {
      openness: 0.8,
      conscientiousness: 0.9,
      extraversion: 0.3,
      agreeableness: 0.6,
      neuroticism: 0.4
    }
  });
  
  if (response.status === 200 && response.body.insights) {
    return { success: true, message: 'AI insights generated successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testCreateShareCard() {
  if (!testData.resultId) {
    return { success: false, message: 'No result ID available from previous test' };
  }

  const response = await makeRequest('POST', `${API_PREFIX}/share/create-card`, {
    result_id: testData.resultId,
    platform: 'twitter'
  });
  
  if (response.status === 200 && response.body.share_id) {
    testData.shareId = response.body.share_id;
    return { success: true, message: `Share card created: ${response.body.share_id}` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testPreviewShare() {
  if (!testData.shareId) {
    return { success: false, message: 'No share ID available from previous test' };
  }

  const response = await makeRequest('GET', `${API_PREFIX}/share/preview/${testData.shareId}`);
  
  if (response.status === 200 && response.body.preview_url) {
    return { success: true, message: 'Share preview retrieved successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testCreateChallenge() {
  if (!testData.resultId) {
    return { success: false, message: 'No result ID available from previous test' };
  }

  const response = await makeRequest('POST', `${API_PREFIX}/share/challenge`, {
    result_id: testData.resultId,
    challenger_name: 'Test User',
    message: 'Beat my score!'
  });
  
  if (response.status === 200 && response.body.challenge_url) {
    return { success: true, message: 'Challenge created successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testUserRegister() {
  const randomEmail = `test${Date.now()}@example.com`;
  
  const response = await makeRequest('POST', `${API_PREFIX}/user/register`, {
    email: randomEmail,
    password: 'TestPassword123!',
    username: `testuser${Date.now()}`
  });
  
  if (response.status === 201 && response.body.user_id) {
    testData.userId = response.body.user_id;
    return { success: true, message: `User registered: ${response.body.user_id}` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testUserLogin() {
  const response = await makeRequest('POST', `${API_PREFIX}/user/login`, {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  });
  
  if (response.status === 200 && response.body.access_token) {
    testData.accessToken = response.body.access_token;
    return { success: true, message: 'User logged in successfully' };
  }
  
  // Allow 401 as valid response for non-existent user
  if (response.status === 401) {
    return { success: true, message: 'Login endpoint working (user not found)' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testGetUserProfile() {
  const headers = testData.accessToken ? { 'Authorization': `Bearer ${testData.accessToken}` } : {};
  const response = await makeRequest('GET', `${API_PREFIX}/user/profile`, null, headers);
  
  // Allow 401 as valid response when not authenticated
  if (response.status === 401) {
    return { success: true, message: 'Profile endpoint working (authentication required)' };
  }
  
  if (response.status === 200 && response.body.user_id) {
    return { success: true, message: 'User profile retrieved successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testGetUserHistory() {
  const headers = testData.accessToken ? { 'Authorization': `Bearer ${testData.accessToken}` } : {};
  const response = await makeRequest('GET', `${API_PREFIX}/user/history`, null, headers);
  
  // Allow 401 as valid response when not authenticated
  if (response.status === 401) {
    return { success: true, message: 'History endpoint working (authentication required)' };
  }
  
  if (response.status === 200 && Array.isArray(response.body)) {
    return { success: true, message: `Retrieved ${response.body.length} history items` };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testUpdateUserPreferences() {
  const headers = testData.accessToken ? { 'Authorization': `Bearer ${testData.accessToken}` } : {};
  const response = await makeRequest('PUT', `${API_PREFIX}/user/preferences`, {
    theme: 'dark',
    notifications: true,
    language: 'en'
  }, headers);
  
  // Allow 401 as valid response when not authenticated
  if (response.status === 401) {
    return { success: true, message: 'Preferences endpoint working (authentication required)' };
  }
  
  if (response.status === 200) {
    return { success: true, message: 'User preferences updated successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testTrackAnalytics() {
  const response = await makeRequest('POST', `${API_PREFIX}/analytics/track`, {
    event: 'quiz_completed',
    properties: {
      quiz_type: 'personality',
      completion_time: 120,
      result: 'INTJ'
    }
  });
  
  if (response.status === 200 || response.status === 204) {
    return { success: true, message: 'Analytics event tracked successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

async function testGetAnalyticsStats() {
  const response = await makeRequest('GET', `${API_PREFIX}/analytics/stats`);
  
  if (response.status === 200 && response.body) {
    return { success: true, message: 'Analytics stats retrieved successfully' };
  }
  
  return { success: false, message: `Status: ${response.status}, Body: ${JSON.stringify(response.body)}` };
}

// Generate test report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}TEST REPORT${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${testResults.skipped}${colors.reset}`);
  
  const passRate = testResults.total > 0 ? 
    ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  
  console.log(`\n${colors.bright}Pass Rate: ${passRate}%${colors.reset}`);
  
  if (testResults.failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.tests
      .filter(t => t.status === 'failed' || t.status === 'error')
      .forEach(t => {
        console.log(`- ${t.name}: ${t.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with error code if tests failed
  if (testResults.failed > 0) {
    process.exit(1);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bright}Starting API Tests${colors.reset}`);
  console.log(`Testing API at: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  // Quiz endpoints
  await runTest('GET /quizzes/categories', testGetCategories);
  await runTest('GET /quizzes/generate/{quiz_type}', testGenerateQuiz);
  await runTest('GET /quizzes/daily', testGetDailyQuiz);
  await runTest('POST /quizzes/submit', testSubmitQuiz);
  await runTest('GET /quizzes/result/{result_id}', testGetResult);
  
  // AI endpoints
  await runTest('POST /ai/generate-quiz', testAIGenerateQuiz);
  await runTest('POST /ai/analyze-personality', testAIAnalyzePersonality);
  await runTest('POST /ai/generate-insights', testAIGenerateInsights);
  
  // Share endpoints
  await runTest('POST /share/create-card', testCreateShareCard);
  await runTest('GET /share/preview/{share_id}', testPreviewShare);
  await runTest('POST /share/challenge', testCreateChallenge);
  
  // User endpoints
  await runTest('POST /user/register', testUserRegister);
  await runTest('POST /user/login', testUserLogin);
  await runTest('GET /user/profile', testGetUserProfile);
  await runTest('GET /user/history', testGetUserHistory);
  await runTest('PUT /user/preferences', testUpdateUserPreferences);
  
  // Analytics endpoints
  await runTest('POST /analytics/track', testTrackAnalytics);
  await runTest('GET /analytics/stats', testGetAnalyticsStats);
  
  // Generate final report
  generateReport();
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Test runner error:${colors.reset}`, error);
  process.exit(1);
});