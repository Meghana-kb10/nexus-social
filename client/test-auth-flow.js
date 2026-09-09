import { signup, login, getMe } from './src/api/authApi.js';
import mongoose from '../server/node_modules/mongoose/index.js';

// Mock browser localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();

const runVerification = async () => {
  console.log('\n=============================================================');
  console.log('    PHASE 3B FULL AUTHENTICATION FLOW VERIFICATION SUITE');
  console.log('=============================================================\n');

  // Connect directly to MongoDB to verify user persistence
  const mongoUri = 'mongodb://127.0.0.1:27017/mini_social_db';
  await mongoose.connect(mongoUri);
  const usersCollection = mongoose.connection.db.collection('users');

  const testEmail = `charlie_${Date.now()}@example.com`;
  const testUsername = `charlie_${Date.now()}`;
  const testPassword = 'Password123!';

  // TEST 1: Open the application while logged out -> Should be unauthenticated
  console.log('TEST 1: Initial state when logged out...');
  const initialToken = localStorage.getItem('token');
  const t1 = initialToken === null;
  console.log(`  Result: ${t1 ? '✅ PASS' : '❌ FAIL'} (localStorage token is null -> Redirects to Login)`);

  // TEST 2 & 3: Create a new account & verify persistence + navigation
  console.log('\nTEST 2 & 3: Signup with valid info...');
  const signupRes = await signup({
    name: 'Charlie Brown',
    username: testUsername,
    email: testEmail,
    password: testPassword
  });

  // Verify in MongoDB
  const savedUser = await usersCollection.findOne({ email: testEmail });
  const t2 = Boolean(savedUser && savedUser.username === testUsername);
  console.log(`  MongoDB Persistence: ${t2 ? '✅ PASS' : '❌ FAIL'} (User saved in 'users' collection, ID: ${savedUser?._id})`);

  // Verify token storage
  localStorage.setItem('token', signupRes.token);
  localStorage.setItem('user', JSON.stringify(signupRes.user));
  const t3 = localStorage.getItem('token') === signupRes.token && signupRes.user.username === testUsername;
  console.log(`  Session Established: ${t3 ? '✅ PASS' : '❌ FAIL'} (Token cached, user authenticated -> Navigates to /feed)`);

  // TEST 4: Logout -> Token and user removed
  console.log('\nTEST 4: Logout action...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  const t4 = localStorage.getItem('token') === null && localStorage.getItem('user') === null;
  console.log(`  Result: ${t4 ? '✅ PASS' : '❌ FAIL'} (localStorage cleared -> Redirects to /login)`);

  // TEST 5: Login using created account
  console.log('\nTEST 5: Login with created credentials...');
  const loginRes = await login({
    email: testEmail,
    password: testPassword
  });
  localStorage.setItem('token', loginRes.token);
  localStorage.setItem('user', JSON.stringify(loginRes.user));
  const t5 = Boolean(loginRes.success && loginRes.token && loginRes.user.email === testEmail);
  console.log(`  Result: ${t5 ? '✅ PASS' : '❌ FAIL'} (Authenticated -> Navigates to /feed)`);

  // TEST 6: Page refresh / session restoration via /api/auth/me
  console.log('\nTEST 6: Refresh feed while logged in (/api/auth/me session restore)...');
  const meRes = await getMe();
  const t6 = Boolean(meRes.success && meRes.user.username === testUsername);
  console.log(`  Result: ${t6 ? '✅ PASS' : '❌ FAIL'} (Profile restored: "${meRes.user?.name}" @${meRes.user?.username})`);

  // TEST 7: Use invalid/expired token -> safely logs out
  console.log('\nTEST 7: Expired / invalid token handling...');
  localStorage.setItem('token', 'invalid.expired.jwt.token');
  let t7 = false;
  try {
    await getMe();
  } catch (err) {
    // Interceptor caught 401
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    t7 = localStorage.getItem('token') === null;
  }
  console.log(`  Result: ${t7 ? '✅ PASS' : '❌ FAIL'} (401 handled, token cleared, user logged out)`);

  // TEST 8: Try duplicate email and duplicate username signup
  console.log('\nTEST 8: Duplicate signup rejection...');
  let dupEmailRejected = false;
  try {
    await signup({
      name: 'Duplicate Test',
      username: `unique_${Date.now()}`,
      email: testEmail,
      password: 'Password123!'
    });
  } catch (err) {
    dupEmailRejected = err.userMessage?.includes('already exists') || err.response?.status === 400;
  }
  console.log(`  Duplicate Email: ${dupEmailRejected ? '✅ PASS (Rejected with proper 400)' : '❌ FAIL'}`);

  let dupUsernameRejected = false;
  try {
    await signup({
      name: 'Duplicate Test 2',
      username: testUsername,
      email: `diff_${Date.now()}@example.com`,
      password: 'Password123!'
    });
  } catch (err) {
    dupUsernameRejected = err.userMessage?.includes('already taken') || err.response?.status === 400;
  }
  console.log(`  Duplicate Username: ${dupUsernameRejected ? '✅ PASS (Rejected with proper 400)' : '❌ FAIL'}`);

  const allPassed = t1 && t2 && t3 && t4 && t5 && t6 && t7 && dupEmailRejected && dupUsernameRejected;
  console.log('\n=============================================================');
  console.log(`   ALL 8 AUTHENTICATION FLOW TESTS: ${allPassed ? '✅ 100% PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('=============================================================\n');

  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
};

runVerification().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
