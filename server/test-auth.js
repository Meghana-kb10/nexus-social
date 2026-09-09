import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const BASE_URL = 'http://127.0.0.1:5000';

const runTests = async () => {
  console.log('\n=============================================');
  console.log('  PHASE 2C AUTHENTICATION VERIFICATION SUITE');
  console.log('=============================================\n');

  // Connect directly to check database state
  await mongoose.connect(process.env.MONGO_URI);
  // Clear any previous test users to ensure clean slate
  await User.deleteMany({ email: { $in: ['alex.rivera@example.com', 'elena@example.com'] } });

  let testUserToken = '';
  let testUserId = '';

  // 1. Signup with valid information -> should succeed
  console.log('Test 1: Signup with valid information...');
  const res1 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Rivera',
      username: 'alexdev',
      email: 'alex.rivera@example.com',
      password: 'StrongPassword123!'
    })
  });
  const data1 = await res1.json();
  const t1Passed = res1.status === 201 && data1.success === true && Boolean(data1.token) && !data1.user.password;
  console.log(`  Result: ${t1Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res1.status})`);
  console.log('  Signup Response Sample:', JSON.stringify(data1, null, 2));

  if (t1Passed) {
    testUserToken = data1.token;
    testUserId = data1.user.id;
  }

  // 2. Signup with duplicate email -> should fail
  console.log('\nTest 2: Signup with duplicate email...');
  const res2 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Another Alex',
      username: 'alex_diff',
      email: 'alex.rivera@example.com',
      password: 'AnotherPassword123!'
    })
  });
  const data2 = await res2.json();
  const t2Passed = res2.status === 400 && data2.success === false && data2.message.includes('email already exists');
  console.log(`  Result: ${t2Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res2.status}, Message: "${data2.message}")`);

  // 3. Signup with duplicate username -> should fail
  console.log('\nTest 3: Signup with duplicate username...');
  const res3 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Different Name',
      username: 'alexdev',
      email: 'different@example.com',
      password: 'AnotherPassword123!'
    })
  });
  const data3 = await res3.json();
  const t3Passed = res3.status === 400 && data3.success === false && data3.message.includes('Username is already taken');
  console.log(`  Result: ${t3Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res3.status}, Message: "${data3.message}")`);

  // 4. Login with correct password -> should succeed
  console.log('\nTest 4: Login with correct password...');
  const res4 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@example.com',
      password: 'StrongPassword123!'
    })
  });
  const data4 = await res4.json();
  const t4Passed = res4.status === 200 && data4.success === true && Boolean(data4.token) && !data4.user.password;
  console.log(`  Result: ${t4Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res4.status})`);
  console.log('  Login Response Sample:', JSON.stringify(data4, null, 2));

  // 5. Login with incorrect password -> should return 401
  console.log('\nTest 5: Login with incorrect password...');
  const res5 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@example.com',
      password: 'WrongPassword999!'
    })
  });
  const data5 = await res5.json();
  const t5Passed = res5.status === 401 && data5.success === false;
  console.log(`  Result: ${t5Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res5.status}, Message: "${data5.message}")`);

  // 6. GET /api/auth/me with valid JWT -> should return current user
  console.log('\nTest 6: GET /api/auth/me with valid JWT...');
  const res6 = await fetch(`${BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${testUserToken}`
    }
  });
  const data6 = await res6.json();
  const t6Passed = res6.status === 200 && data6.success === true && data6.user.username === 'alexdev' && !data6.user.password;
  console.log(`  Result: ${t6Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res6.status})`);
  console.log('  GetMe Response Sample:', JSON.stringify(data6, null, 2));

  // 7. GET /api/auth/me without JWT -> should return 401
  console.log('\nTest 7: GET /api/auth/me without JWT...');
  const res7 = await fetch(`${BASE_URL}/api/auth/me`, {
    method: 'GET'
  });
  const data7 = await res7.json();
  const t7Passed = res7.status === 401 && data7.success === false;
  console.log(`  Result: ${t7Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res7.status}, Message: "${data7.message}")`);

  // 8. GET /api/auth/me with invalid JWT -> should return 401
  console.log('\nTest 8: GET /api/auth/me with invalid JWT...');
  const res8 = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: 'Bearer invalid.token.payload'
    }
  });
  const data8 = await res8.json();
  const t8Passed = res8.status === 401 && data8.success === false;
  console.log(`  Result: ${t8Passed ? '✅ PASS' : '❌ FAIL'} (Status: ${res8.status}, Message: "${data8.message}")`);

  // 9. Confirm password is hashed in MongoDB
  console.log('\nTest 9: Confirm password is hashed in MongoDB...');
  const dbUser = await User.findById(testUserId).select('+password');
  const isHashed = dbUser.password && dbUser.password.startsWith('$2') && dbUser.password.length >= 60;
  console.log(`  Stored DB Password Hash: ${dbUser.password.substring(0, 25)}... (length: ${dbUser.password.length})`);
  console.log(`  Result: ${isHashed ? '✅ PASS (Bcrypt hash confirmed)' : '❌ FAIL'}`);

  // 10. Confirm password/hash is never returned in API responses
  console.log('\nTest 10: Confirm password/hash is never returned in API responses...');
  const noPasswordInSignup = data1.user && !('password' in data1.user);
  const noPasswordInLogin = data4.user && !('password' in data4.user);
  const noPasswordInMe = data6.user && !('password' in data6.user);
  const t10Passed = noPasswordInSignup && noPasswordInLogin && noPasswordInMe;
  console.log(`  Signup Excludes Password: ${noPasswordInSignup}`);
  console.log(`  Login Excludes Password: ${noPasswordInLogin}`);
  console.log(`  Me Excludes Password: ${noPasswordInMe}`);
  console.log(`  Result: ${t10Passed ? '✅ PASS (Zero sensitive password leak)' : '❌ FAIL'}`);

  console.log('\n=============================================');
  const allPassed = t1Passed && t2Passed && t3Passed && t4Passed && t5Passed && t6Passed && t7Passed && t8Passed && isHashed && t10Passed;
  console.log(`  ALL 10 TESTS: ${allPassed ? '✅ 100% PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('=============================================\n');

  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
};

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
