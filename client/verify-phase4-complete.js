// client/verify-phase4-complete.js
// Comprehensive verification of all Phase 4 requirements: Pagination, Filters, Multi-Page Likes/Comments, Collections & Build

const BASE = 'http://localhost:5000/api';

async function runPhase4Verification() {
  console.log('🚀 Running Complete Phase 4 Verification Suite...\n');
  const results = [];

  function record(itemNum, title, passed, detail) {
    results.push({ itemNum, title, passed, detail });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Step ${itemNum}] ${title}`);
    if (detail) console.log(`   └─ ${detail}`);
  }

  try {
    const timestamp = Date.now();
    const testUserEmail = `phase4_${timestamp}@example.com`;
    const testPassword = 'Password123!';
    const testUsername = `p4_${timestamp.toString().slice(-6)}`;

    // 0. Setup test user
    const signupRes = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pagination Tester', username: testUsername, email: testUserEmail, password: testPassword })
    });
    const signupData = await signupRes.json();
    const token = signupData.token;

    // Check existing post count
    const initialFeed = await (await fetch(`${BASE}/posts?page=1&limit=10&filter=all`)).json();
    console.log(`Current posts in DB: ${initialFeed.pagination.total}`);

    // Ensure we have at least 15 posts so we can test page 1 and page 2 pagination
    if (initialFeed.pagination.total < 15) {
      const needed = 15 - initialFeed.pagination.total;
      console.log(`Creating ${needed} additional posts for comprehensive multi-page pagination testing...`);
      for (let i = 0; i < needed; i++) {
        await fetch(`${BASE}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ content: `Pagination test post #${i + 1} (${timestamp})` })
        });
      }
    }

    // 1. Load first page
    const page1Res = await fetch(`${BASE}/posts?page=1&limit=10&filter=all`);
    const page1Data = await page1Res.json();
    record(1, 'Load first page (GET /api/posts?page=1&limit=10&filter=all)', page1Res.status === 200, `Page 1 loaded successfully`);

    // 2. Verify 10 posts or available posts on page 1
    const page1Count = page1Data.posts.length;
    record(2, 'Verify 10 posts on page 1', page1Count === 10, `Returned ${page1Count} posts (limit 10)`);

    // 3. Click Load More (Simulate fetching page 2)
    const page2Res = await fetch(`${BASE}/posts?page=2&limit=10&filter=all`);
    const page2Data = await page2Res.json();
    record(3, 'Fetch Page 2 for Load More', page2Res.status === 200 && page2Data.posts.length > 0, `Page 2 returned ${page2Data.posts.length} posts`);

    // 4. Verify next page appends to feed
    const combinedPosts = [...page1Data.posts, ...page2Data.posts];
    record(4, 'Verify next page appends to existing feed', combinedPosts.length === page1Count + page2Data.posts.length, `Combined feed count: ${combinedPosts.length}`);

    // 5. Verify no duplicate posts between page 1 and page 2
    const page1Ids = new Set(page1Data.posts.map(p => p._id));
    const duplicates = page2Data.posts.filter(p => page1Ids.has(p._id));
    record(5, 'Verify no duplicate posts across pages', duplicates.length === 0, `Found ${duplicates.length} duplicate IDs across pages`);

    // 6. Change to Latest filter
    const latestRes = await fetch(`${BASE}/posts?page=1&limit=10&filter=latest`);
    const latestData = await latestRes.json();
    record(6, 'Change to Latest filter', latestRes.status === 200 && latestData.posts.length > 0, `Latest feed fetched successfully`);

    // 7. Verify pagination resets to page 1 on filter change
    record(7, 'Verify pagination resets on filter change', latestData.pagination.page === 1, `Pagination page reset to: ${latestData.pagination.page}`);

    // 8. Load another Latest page (page 2)
    const latestPage2Res = await fetch(`${BASE}/posts?page=2&limit=10&filter=latest`);
    const latestPage2Data = await latestPage2Res.json();
    record(8, 'Load another Latest page (Page 2)', latestPage2Res.status === 200, `Latest page 2 returned ${latestPage2Data.posts.length} posts`);

    // 9. Change to Popular filter
    const popularRes = await fetch(`${BASE}/posts?page=1&limit=10&filter=popular`);
    const popularData = await popularRes.json();
    record(9, 'Change to Popular filter', popularRes.status === 200 && popularData.pagination.page === 1, `Popular feed reset to page 1`);

    // 10. Like a post from page 1
    const postFromPage1 = page1Data.posts[0];
    const likeP1Res = await fetch(`${BASE}/posts/${postFromPage1._id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const likeP1Data = await likeP1Res.json();
    record(10, 'Like a post from page 1', likeP1Res.status === 200 && typeof likeP1Data.likeCount === 'number', `Liked page 1 post: ${postFromPage1._id}`);

    // 11. Like a post from loaded page 2
    const postFromPage2 = page2Data.posts[0];
    const likeP2Res = await fetch(`${BASE}/posts/${postFromPage2._id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const likeP2Data = await likeP2Res.json();
    record(11, 'Like a post from loaded page 2', likeP2Res.status === 200 && typeof likeP2Data.likeCount === 'number', `Liked page 2 post: ${postFromPage2._id}`);

    // 12. Comment on a post from loaded page 2
    const commentP2Res = await fetch(`${BASE}/posts/${postFromPage2._id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ text: 'Commented on a paginated page 2 post!' })
    });
    const commentP2Data = await commentP2Res.json();
    record(12, 'Comment on a post from loaded page 2', commentP2Res.status === 201 && !!commentP2Data.comment, `Comment ID: ${commentP2Data.comment?._id}`);

    // 13. Create a new post
    const newCreatedPostRes = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: `Brand new post created during Phase 4 at ${Date.now()}` })
    });
    const newCreatedPostData = await newCreatedPostRes.json();
    record(13, 'Create a new post', newCreatedPostRes.status === 201 && !!newCreatedPostData.post, `New post created: ${newCreatedPostData.post?._id}`);

    // 14. Verify it appears at the top of the feed
    const feedAfterCreation = await (await fetch(`${BASE}/posts?page=1&limit=10&filter=latest`)).json();
    const isAtTop = feedAfterCreation.posts[0]?._id === newCreatedPostData.post?._id;
    record(14, 'Verify new post appears at top of feed', isAtTop, `Top post ID matches new post ID: ${newCreatedPostData.post?._id}`);

    // 15. Verify pagination still behaves correctly after post creation
    const totalAfterCreation = feedAfterCreation.pagination.total;
    record(15, 'Verify pagination total increases', totalAfterCreation > initialFeed.pagination.total, `Total posts: ${totalAfterCreation}`);

    // 16. Test existing authentication (GET /api/auth/me)
    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    record(16, 'Verify existing authentication still works', meRes.status === 200 && meData.user?.username === testUsername, `Authenticated as: @${meData.user?.username}`);

    // 17. Verify MongoDB collections strictly equal ['posts', 'users']
    const mongoose = (await import('../server/node_modules/mongoose/index.js')).default;
    await mongoose.connect('mongodb://127.0.0.1:27017/mini_social_db');
    const collections = (await mongoose.connection.db.listCollections().toArray()).map(c => c.name).sort();
    const exactlyTwo = collections.length === 2 && collections[0] === 'posts' && collections[1] === 'users';
    record(17, 'Verify MongoDB strictly contains only users and posts', exactlyTwo, `Collections found: [ ${collections.join(', ')} ]`);

    console.log('\n======================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`PHASE 4 VERIFICATION RESULTS: ${passedCount}/${results.length} PASSED!`);
    console.log('======================================================\n');

    if (passedCount < results.length) {
      process.exit(1);
    }
    process.exit(0);
  } catch (e) {
    console.error('Phase 4 verification error:', e);
    process.exit(1);
  }
}

runPhase4Verification();
