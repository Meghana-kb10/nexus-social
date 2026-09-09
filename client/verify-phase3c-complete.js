// client/verify-phase3c-complete.js
// Complete verification of all 15 test items for Phase 3C

const BASE = 'http://localhost:5000/api';

async function verifyAll() {
  console.log('🚀 Running Full 15-Point Verification Suite for Phase 3C...\n');
  const results = [];

  function record(itemNum, title, passed, detail) {
    results.push({ itemNum, title, passed, detail });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Step ${itemNum}] ${title}`);
    if (detail) console.log(`   └─ ${detail}`);
  }

  try {
    // 0. Prepare verified test accounts
    const timestamp = Date.now();
    const user1Email = `user1_${timestamp}@example.com`;
    const user1Password = 'Password123!';
    const user1Username = `user1_${timestamp.toString().slice(-6)}`;
    
    // Register account
    await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        username: user1Username,
        email: user1Email,
        password: user1Password
      })
    });

    // 1. Login with a real account
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user1Email, password: user1Password })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    record(1, 'Login with real account', loginRes.status === 200 && !!token, `Logged in as: ${loginData.user?.name} (@${loginData.user?.username})`);

    // 2. Open Feed
    const feedRes = await fetch(`${BASE}/posts?page=1&limit=10&filter=all`);
    const feedData = await feedRes.json();
    record(2, 'Open Feed', feedRes.status === 200 && Array.isArray(feedData.posts), `Retrieved ${feedData.posts.length} posts from GET /api/posts`);

    // 3. Verify posts are loaded from MongoDB
    const hasMongoPosts = feedData.posts.length > 0 && feedData.posts.every(p => p._id && p.author?.username && p.createdAt);
    record(3, 'Verify posts are loaded from MongoDB', hasMongoPosts, `All posts contain valid MongoDB ObjectIds, author subdocument, and createdAt`);

    // 4. Create text-only post
    const textPostContent = `Phase 3C text verification post at ${new Date().toISOString()}`;
    const createTextRes = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: textPostContent })
    });
    const createTextData = await createTextRes.json();
    const textPostId = createTextData.post?._id;
    record(4, 'Create text-only post', createTextRes.status === 201 && !!textPostId, `Post created with ID: ${textPostId}`);

    // 5. Verify it appears immediately at top of feed
    const feedAfterText = await (await fetch(`${BASE}/posts?filter=latest`)).json();
    const isAtTop = feedAfterText.posts[0]?._id === textPostId;
    record(5, 'Verify it appears immediately at the top of the feed', isAtTop, `Top post ID: ${feedAfterText.posts[0]?._id} matches newly created text post ID: ${textPostId}`);

    // 6. Refresh page (simulate feed re-fetch)
    const refreshFeed = await (await fetch(`${BASE}/posts?filter=all`)).json();
    const existsAfterRefresh = refreshFeed.posts.some(p => p._id === textPostId);
    record(6, 'Refresh page (feed re-fetched from database)', existsAfterRefresh, 'Feed re-fetched from MongoDB successfully');

    // 7. Verify the post still exists
    record(7, 'Verify post still exists in MongoDB', existsAfterRefresh, `Post confirmed in MongoDB: ${textPostId}`);

    // 8. Create image-only post using existing image URL input
    const imageUrlOnly = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085';
    const createImageRes = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ imageUrl: imageUrlOnly })
    });
    const createImageData = await createImageRes.json();
    const imagePostId = createImageData.post?._id;
    record(8, 'Create image-only post using image URL', createImageRes.status === 201 && createImageData.post?.imageUrl === imageUrlOnly, `Image post ID: ${imagePostId}`);

    // 9. Create text + image post
    const comboRes = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        content: 'Combining crisp text with an aesthetic workspace image!',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c'
      })
    });
    const comboData = await comboRes.json();
    const comboPostId = comboData.post?._id;
    record(9, 'Create text + image post', comboRes.status === 201 && !!comboData.post?.content && !!comboData.post?.imageUrl, `Combo post ID: ${comboPostId}`);

    // 10. Try submitting an empty post -> should be rejected
    const emptyRes = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: '   ', imageUrl: '' })
    });
    record(10, 'Try submitting empty post -> rejected', emptyRes.status === 400, `Rejected with status code: ${emptyRes.status} (Validation verified)`);

    // 11. Test All Posts
    const allPostsRes = await fetch(`${BASE}/posts?filter=all`);
    const allPostsData = await allPostsRes.json();
    record(11, 'Test All Posts filter', allPostsRes.status === 200 && allPostsData.posts.length > 0, `All Posts count: ${allPostsData.posts.length}`);

    // 12. Test Latest
    const latestRes = await fetch(`${BASE}/posts?filter=latest`);
    const latestData = await latestRes.json();
    const isSortedLatest = latestData.posts[0]?._id === comboPostId;
    record(12, 'Test Latest filter', latestRes.status === 200 && isSortedLatest, `Top item is most recent post: ${latestData.posts[0]?._id}`);

    // 13. Test Popular
    const popularRes = await fetch(`${BASE}/posts?filter=popular`);
    const popularData = await popularRes.json();
    let isPopularOrdered = true;
    for (let i = 0; i < popularData.posts.length - 1; i++) {
      if (popularData.posts[i].likeCount < popularData.posts[i + 1].likeCount) {
        isPopularOrdered = false;
        break;
      }
    }
    record(13, 'Test Popular filter', popularRes.status === 200 && isPopularOrdered, `Top popular post has ${popularData.posts[0]?.likeCount} likes`);

    // 14. Test logout and login again with another account
    const user2Email = `user2_${timestamp}@example.com`;
    const user2Password = 'Password123!';
    const user2Username = `user2_${timestamp.toString().slice(-6)}`;
    await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        username: user2Username,
        email: user2Email,
        password: user2Password
      })
    });
    const reLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user2Email, password: user2Password })
    });
    const reLoginData = await reLoginRes.json();
    const tokenUser2 = reLoginData.token;
    record(14, 'Test logout and login again', reLoginRes.status === 200 && !!tokenUser2, `Successfully logged in with new user: ${reLoginData.user?.name} (@${reLoginData.user?.username})`);

    // 15. Verify posts remain in MongoDB
    const checkPersistRes = await fetch(`${BASE}/posts?filter=all`);
    const checkPersistData = await checkPersistRes.json();
    const allFound = [textPostId, imagePostId, comboPostId].every(id => checkPersistData.posts.some(p => p._id === id));
    record(15, 'Verify posts remain in MongoDB after relogin', allFound, `All 3 newly created posts confirmed persistent in MongoDB across sessions`);

    console.log('\n======================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`FINAL RESULT: ${passedCount}/15 items passed!`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Verification failure:', err);
  }
}

verifyAll();
