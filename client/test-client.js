import client from './src/api/client.js';
import * as authApi from './src/api/authApi.js';
import * as postApi from './src/api/postApi.js';

console.log('\n=============================================');
console.log('    PHASE 3A API LAYER VERIFICATION SUITE');
console.log('=============================================\n');

// 1. Check authApi functions
console.log('1. authApi Exports:');
const authFns = ['signup', 'login', 'getMe'];
authFns.forEach(fn => {
  console.log(`   - ${fn}: ${typeof authApi[fn] === 'function' ? '✅ Function exists' : '❌ Missing'}`);
});
const hasAuthMethods = authFns.every(fn => typeof authApi[fn] === 'function');

// 2. Check postApi functions
console.log('\n2. postApi Exports:');
const postFns = ['getFeed', 'createPost', 'toggleLike', 'addComment', 'getPostById'];
postFns.forEach(fn => {
  console.log(`   - ${fn}: ${typeof postApi[fn] === 'function' ? '✅ Function exists' : '❌ Missing'}`);
});
const hasPostMethods = postFns.every(fn => typeof postApi[fn] === 'function');

// 3. Check client default config
console.log('\n3. Axios Client Configuration:');
console.log(`   - Base URL: ${client.defaults.baseURL || 'http://localhost:5000/api'}`);
console.log(`   - Content-Type: ${client.defaults.headers['Content-Type']}`);

// 4. Test request interceptor behavior:
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; },
  removeItem(k) { delete this.store[k]; }
};

const interceptor = client.interceptors.request.handlers[0].fulfilled;

// Case A: Valid Token
localStorage.setItem('token', 'sample.jwt.token');
const req1 = interceptor({ headers: {} });
const tA = req1.headers.Authorization === 'Bearer sample.jwt.token';
console.log(`\n4. JWT Token Header Interceptor:`);
console.log(`   - Valid token attached: ${tA ? '✅ PASS' : '❌ FAIL'} (${req1.headers.Authorization})`);

// Case B: No Token
localStorage.removeItem('token');
const req2 = interceptor({ headers: {} });
const tB = !req2.headers.Authorization;
console.log(`   - No token -> No header: ${tB ? '✅ PASS' : '❌ FAIL'}`);

// Case C: Null string
localStorage.setItem('token', 'null');
const req3 = interceptor({ headers: {} });
const tC = !req3.headers.Authorization;
console.log(`   - "null" string -> No header: ${tC ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n=============================================');
const allPassed = hasAuthMethods && hasPostMethods && tA && tB && tC;
console.log(`   ALL VERIFICATIONS: ${allPassed ? '✅ 100% PASSED' : '❌ FAILED'}`);
console.log('=============================================\n');

process.exit(allPassed ? 0 : 1);
