// Simple test for JWT utility functions
const jwtUtils = require('./src/utils/jwtToken');

// Test 1: JWT 토큰 생성
console.log('Testing JWT token creation...');
const payload = { userId: 1, email: 'test@example.com' };
const token = jwtUtils.sign(payload);
console.log('Generated token:', token);

// Test 2: JWT 토큰 검증
console.log('\nTesting JWT token verification...');
try {
  const decoded = jwtUtils.verify(token);
  console.log('Decoded payload:', decoded);
  
  // Verify that the decoded payload matches the original
  if (decoded.userId === payload.userId && decoded.email === payload.email) {
    console.log('✅ Token creation and verification test PASSED');
  } else {
    console.log('❌ Token creation and verification test FAILED - payload mismatch');
  }
} catch (error) {
  console.log('❌ Token verification test FAILED:', error.message);
}

// Test 3: Invalid token handling
console.log('\nTesting invalid token handling...');
try {
  jwtUtils.verify('invalid.token.here');
  console.log('❌ Invalid token test FAILED - should have thrown an error');
} catch (error) {
  console.log('✅ Invalid token test PASSED - correctly threw error:', error.message);
}

console.log('\nAll tests completed!');