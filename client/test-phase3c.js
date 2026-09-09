// client/test-phase3c.js
// Automated verification for Phase 3C: Connect Real Posts & Feed

const API_BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Phase 3C Verification Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate with a test user
    console.log('--- Step 1: Authentication ---');
    const userEmail = `tester_${Date.now()}@example.com`;
    const signupRes = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Sparks',
        username: `jordan_${Date.now().toString().slice(-6)}`,
        email: userEmail,
        password: 'Password123!'
      })
    });
    const signupData = await signupRes.json();
    assert(signupRes.status === 201 && signupData.token, 'Signup and JWT generation succeeds');
    const token = signupData.token;

    // 2. Fetch Feed (GET /api/posts?filter=all&page=1&limit=10)
    console.log('\n--- Step 2: Fetch Real Feed ---');
    const feedRes = await fetch(`${API_BASE_URL}/posts?filter=all&page=1&limit=10`);
    const feedData = await feedRes.json();
    assert(feedRes.status === 200, 'GET /api/posts returns 200 OK');
    assert(Array.isArray(feedData.posts), 'Feed response contains posts array from MongoDB');
    assert(feedData.pagination && typeof feedData.pagination.total === 'number', 'Feed response contains pagination metadata');
    console.log(`Initial MongoDB post count: ${feedData.posts.length} (total in DB: ${feedData.pagination.total})`);

    // 3. Validation: Reject Empty Post
    console.log('\n--- Step 3: Validation - Reject Empty Post ---');
    const emptyRes = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: '', imageUrl: '' })
    });
    const emptyData = await emptyRes.json();
    assert(emptyRes.status === 400 && !emptyData.success, 'Reject empty post with 400 Bad Request');

    const whitespaceRes = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: '     \n\t   ' })
    });
    const whitespaceData = await whitespaceRes.json();
    assert(whitespaceRes.status === 400 && !whitespaceData.success, 'Reject whitespace-only post with 400 Bad Request');

    // 4. Create Text-Only Post
    console.log('\n--- Step 4: Create Text-Only Post ---');
    const textPostRes = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: 'Phase 3C text-only post verifying real MongoDB connectivity! 🚀'
      })
    });
    const textPostData = await textPostRes.json();
    assert(textPostRes.status === 201 && textPostData.post, 'Text-only post created with 201 Created');
    assert(textPostData.post.author.name === 'Jordan Sparks', 'Post author name mapped from JWT correctly');
    assert(textPostData.post.author.username === signupData.user.username, 'Post author username mapped from JWT correctly');
    assert(textPostData.post.likeCount === 0 && textPostData.post.commentCount === 0, 'Post initialized with likeCount=0 and commentCount=0');
    assert(textPostData.post.createdAt, 'Post contains createdAt timestamp');

    // 5. Create Image-Only Post
    console.log('\n--- Step 5: Create Image-Only Post ---');
    const imagePostRes = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
      })
    });
    const imagePostData = await imagePostRes.json();
    assert(imagePostRes.status === 201 && imagePostData.post, 'Image-only post created with 201 Created');
    assert(imagePostData.post.imageUrl === 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'Image URL saved correctly');

    // 6. Create Text + Image Post
    console.log('\n--- Step 6: Create Text + Image Post ---');
    const comboPostRes = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: 'Check out this awesome modern tech stack setup!',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
      })
    });
    const comboPostData = await comboPostRes.json();
    assert(comboPostRes.status === 201 && comboPostData.post, 'Text + Image post created with 201 Created');
    assert(comboPostData.post.content && comboPostData.post.imageUrl, 'Both content and imageUrl saved');

    // 7. Verify Feed has newly created posts at top (latest order)
    console.log('\n--- Step 7: Verify Posts at Top of Feed ---');
    const updatedFeedRes = await fetch(`${API_BASE_URL}/posts?filter=latest&page=1&limit=10`);
    const updatedFeedData = await updatedFeedRes.json();
    assert(updatedFeedData.posts[0]._id === comboPostData.post._id, 'Latest post appears at top of feed');
    assert(updatedFeedData.posts[1]._id === imagePostData.post._id, 'Second latest post appears next');
    assert(updatedFeedData.posts[2]._id === textPostData.post._id, 'Third latest post appears third');

    // 8. Test Filters
    console.log('\n--- Step 8: Test Filter Endpoints ---');
    const filterAllRes = await fetch(`${API_BASE_URL}/posts?filter=all`);
    const filterLatestRes = await fetch(`${API_BASE_URL}/posts?filter=latest`);
    const filterPopularRes = await fetch(`${API_BASE_URL}/posts?filter=popular`);
    assert(filterAllRes.status === 200, 'GET /api/posts?filter=all succeeds');
    assert(filterLatestRes.status === 200, 'GET /api/posts?filter=latest succeeds');
    assert(filterPopularRes.status === 200, 'GET /api/posts?filter=popular succeeds');

    const popularData = await filterPopularRes.json();
    let isSortedByLikes = true;
    for (let i = 0; i < popularData.posts.length - 1; i++) {
      if (popularData.posts[i].likeCount < popularData.posts[i + 1].likeCount) {
        isSortedByLikes = false;
        break;
      }
    }
    assert(isSortedByLikes, 'Popular filter sorts posts by likeCount in descending order');

    // 9. Verify Post Persistence (Simulate Refresh)
    console.log('\n--- Step 9: Post Persistence in MongoDB ---');
    const getPostRes = await fetch(`${API_BASE_URL}/posts/${textPostData.post._id}`);
    const getPostData = await getPostRes.json();
    assert(getPostRes.status === 200 && getPostData.post, 'Post retrieved directly by ID from MongoDB');
    assert(getPostData.post.content === textPostData.post.content, 'Post content perfectly intact in MongoDB');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (e) {
    console.error('Test execution error:', e);
    process.exit(1);
  }
}

runTests();
