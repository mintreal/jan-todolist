// Simple test for authentication middleware
const { authenticateToken } = require('./src/middleware/auth');
const jwtUtils = require('./src/utils/jwtToken');

// Mock Express request and response objects for our test
function createMockRequest(headers = {}) {
  return {
    headers: headers
  };
}

function createMockResponse() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.body = data;
    return this;
  };
  return res;
}

function createMockNext() {
  return function() {
    // Next function - just continues execution
  };
}

console.log('Testing authentication middleware...');

// Test 1: Valid token in authorization header
console.log('\n1. Testing with valid token...');
let req = createMockRequest({ 'authorization': `Bearer ${jwtUtils.sign({ userId: 1, email: 'test@example.com' })}` });
let res = createMockResponse();
let next = createMockNext;

authenticateToken(req, res, next);

if (req.user && req.user.userId === 1 && res.statusCode === undefined) {
  console.log('✅ Valid token test PASSED');
} else {
  console.log('❌ Valid token test FAILED - req.user:', req.user, 'status code:', res.statusCode);
}

// Test 2: No token provided
console.log('\n2. Testing without token...');
req = createMockRequest();
res = createMockResponse();
next = createMockNext;

authenticateToken(req, res, next);

if (res.statusCode === 401) {
  console.log('✅ No token test PASSED');
} else {
  console.log('❌ No token test FAILED - status code:', res.statusCode);
}

// Test 3: Invalid token
console.log('\n3. Testing with invalid token...');
req = createMockRequest({ 'authorization': 'Bearer invalid.token.here' });
res = createMockResponse();
next = createMockNext;

authenticateToken(req, res, next);

if (res.statusCode === 403) {
  console.log('✅ Invalid token test PASSED');
} else {
  console.log('❌ Invalid token test FAILED - status code:', res.statusCode);
}

// Test 4: Token without "Bearer " prefix
console.log('\n4. Testing token without Bearer prefix...');
req = createMockRequest({ 'authorization': jwtUtils.sign({ userId: 2 }) });
res = createMockResponse();
next = createMockNext;

authenticateToken(req, res, next);

if (res.statusCode === 401) { // Should fail because no "Bearer " prefix
  console.log('✅ Missing Bearer prefix test PASSED');
} else {
  console.log('❌ Missing Bearer prefix test FAILED - status code:', res.statusCode);
}

console.log('\nAuthentication middleware tests completed!');