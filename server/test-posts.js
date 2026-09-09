import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Post from './src/models/Post.js';

dotenv.config();

const BASE_URL = 'http://127.0.0.1:5000';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('       PHASE 2D POST APIs VERIFICATION SUITE');
  console.log('======================================================\n');

  await mongoose.connect(process.env.MONGO_URI);

  // Setup test users in MongoDB
  await User.deleteMany({ email: { $in: ['user1@test.com', 'user2@test.com'] } });
  await Post.deleteMany({});

  // 1. Register User 1
  const resU1 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Cooper',
      username: 'alice_c',
      email: 'user1@test.com',
      password: 'Password123!'
    })
  });
  const dataU1 = await resU1.json();
  const token1 = dataU1.token;

  // 2. Register User 2
  const resU2 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob Marley',
      username: 'bob_m',
      email: 'user2@test.com',
      password: 'Password123!'
    })
  });
  const dataU2 = await resU2.json();
  const token2 = dataU2.token;

  let textPostId = '';
  let imagePostId = '';
  let combinedPostId = '';

  // ----------------------------------------------------------------
  // CREATE POST TESTS (1 to 5)
  // ----------------------------------------------------------------
  console.log('--- CREATE POST TESTS ---');

  // Test 1: Text-only post
  const res1 = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ content: 'Just testing a text-only post on Nexus Social!' })
  });
  const d1 = await res1.json();
  const t1 = res1.status === 201 && d1.success && d1.post.content && !d1.post.imageUrl;
  textPostId = d1.post?._id;
  console.log(`1. Text-only post: ${t1 ? '✅ PASS' : '❌ FAIL'} (Status: ${res1.status})`);

  // Test 2: Image-only post
  const res2 = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71' })
  });
  const d2 = await res2.json();
  const t2 = res2.status === 201 && d2.success && d2.post.imageUrl && !d2.post.content;
  imagePostId = d2.post?._id;
  console.log(`2. Image-only post: ${t2 ? '✅ PASS' : '❌ FAIL'} (Status: ${res2.status})`);

  // Test 3: Text + image
  const res3 = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      content: 'Beautiful workspace setup with modern dark mode aesthetic!',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
    })
  });
  const d3 = await res3.json();
  const t3 = res3.status === 201 && d3.success && d3.post.content && d3.post.imageUrl;
  combinedPostId = d3.post?._id;
  console.log(`3. Text + image post: ${t3 ? '✅ PASS' : '❌ FAIL'} (Status: ${res3.status})`);

  // Test 4: Empty post -> reject
  const res4 = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ content: '   ', imageUrl: '' })
  });
  const d4 = await res4.json();
  const t4 = res4.status === 400 && d4.success === false;
  console.log(`4. Empty post rejected: ${t4 ? '✅ PASS' : '❌ FAIL'} (Status: ${res4.status}, Message: "${d4.message}")`);

  // Test 5: Unauthenticated create -> 401
  const res5 = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Trying to post without login' })
  });
  const d5 = await res5.json();
  const t5 = res5.status === 401 && d5.success === false;
  console.log(`5. Unauthenticated create rejected: ${t5 ? '✅ PASS' : '❌ FAIL'} (Status: ${res5.status})`);

  // ----------------------------------------------------------------
  // FEED TESTS (6 to 9)
  // ----------------------------------------------------------------
  console.log('\n--- FEED TESTS ---');

  // Test 6: Get posts
  const res6 = await fetch(`${BASE_URL}/api/posts`);
  const d6 = await res6.json();
  const t6 = res6.status === 200 && d6.success && Array.isArray(d6.posts) && d6.posts.length === 3;
  console.log(`6. Get public feed: ${t6 ? '✅ PASS' : '❌ FAIL'} (Found ${d6.posts?.length} posts)`);

  // Test 7: Pagination
  const res7 = await fetch(`${BASE_URL}/api/posts?page=1&limit=2`);
  const d7 = await res7.json();
  const t7 = res7.status === 200 && d7.posts.length === 2 && d7.pagination.total === 3 && d7.pagination.hasMore === true;
  console.log(`7. Pagination (limit=2): ${t7 ? '✅ PASS' : '❌ FAIL'} (Returned: ${d7.posts?.length}, hasMore: ${d7.pagination?.hasMore})`);

  // Test 8: Latest sorting
  const res8 = await fetch(`${BASE_URL}/api/posts?filter=latest`);
  const d8 = await res8.json();
  const t8 = res8.status === 200 && d8.posts[0]._id === combinedPostId;
  console.log(`8. Latest sorting (newest first): ${t8 ? '✅ PASS' : '❌ FAIL'}`);

  // ----------------------------------------------------------------
  // LIKE / UNLIKE TESTS (10 to 14)
  // ----------------------------------------------------------------
  console.log('\n--- LIKE / UNLIKE TESTS ---');

  // Test 10: Like a post
  const res10 = await fetch(`${BASE_URL}/api/posts/${textPostId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` }
  });
  const d10 = await res10.json();
  const t10 = res10.status === 200 && d10.success && d10.liked === true && d10.likeCount === 1;
  console.log(`10. Like a post: ${t10 ? '✅ PASS' : '❌ FAIL'} (liked: ${d10.liked}, count: ${d10.likeCount})`);

  // Test 11: Like the same post again -> should unlike
  const res11 = await fetch(`${BASE_URL}/api/posts/${textPostId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` }
  });
  const d11 = await res11.json();
  const t11 = res11.status === 200 && d11.success && d11.liked === false && d11.likeCount === 0;
  console.log(`11. Unlike same post: ${t11 ? '✅ PASS' : '❌ FAIL'} (liked: ${d11.liked}, count: ${d11.likeCount})`);

  // Test 12: Like count updates correctly (User 1 likes, User 2 likes)
  await fetch(`${BASE_URL}/api/posts/${combinedPostId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` }
  });
  const res12 = await fetch(`${BASE_URL}/api/posts/${combinedPostId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` }
  });
  const d12 = await res12.json();
  const t12 = res12.status === 200 && d12.likeCount === 2;
  console.log(`12. Like count updates correctly: ${t12 ? '✅ PASS' : '❌ FAIL'} (count: ${d12.likeCount})`);

  // Test 13: Duplicate likes must not occur
  // Try sending another like with token2 (simulate race or duplicate)
  const dbPost = await Post.findById(combinedPostId);
  const user2Likes = dbPost.likes.filter(l => l.userId.toString() === dataU2.user.id.toString());
  const t13 = user2Likes.length === 1;
  console.log(`13. Duplicate likes prevention: ${t13 ? '✅ PASS' : '❌ FAIL'} (User 2 like entries: ${user2Likes.length})`);

  // Test 9 (Popular sorting, now that combinedPostId has 2 likes):
  const res9 = await fetch(`${BASE_URL}/api/posts?filter=popular`);
  const d9 = await res9.json();
  const t9 = res9.status === 200 && d9.posts[0]._id === combinedPostId && d9.posts[0].likeCount === 2;
  console.log(`9. Popular sorting (highest likeCount first): ${t9 ? '✅ PASS' : '❌ FAIL'} (Top post likeCount: ${d9.posts[0]?.likeCount})`);

  // Test 14: Unauthenticated like -> 401
  const res14 = await fetch(`${BASE_URL}/api/posts/${textPostId}/like`, {
    method: 'POST'
  });
  const d14 = await res14.json();
  const t14 = res14.status === 401 && d14.success === false;
  console.log(`14. Unauthenticated like rejected: ${t14 ? '✅ PASS' : '❌ FAIL'} (Status: ${res14.status})`);

  // ----------------------------------------------------------------
  // COMMENT TESTS (15 to 19)
  // ----------------------------------------------------------------
  console.log('\n--- COMMENT TESTS ---');

  // Test 15: Add comment
  const res15 = await fetch(`${BASE_URL}/api/posts/${textPostId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ text: 'Great insight on this architecture!' })
  });
  const d15 = await res15.json();
  const t15 = res15.status === 201 && d15.success && d15.comment.text === 'Great insight on this architecture!';
  console.log(`15. Add comment: ${t15 ? '✅ PASS' : '❌ FAIL'} (Status: ${res15.status})`);

  // Test 16: Empty comment -> reject
  const res16 = await fetch(`${BASE_URL}/api/posts/${textPostId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ text: '   ' })
  });
  const d16 = await res16.json();
  const t16 = res16.status === 400 && d16.success === false;
  console.log(`16. Empty comment rejected: ${t16 ? '✅ PASS' : '❌ FAIL'} (Status: ${res16.status}, Message: "${d16.message}")`);

  // Test 17: Comment count updates
  const res17 = await fetch(`${BASE_URL}/api/posts/${textPostId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
    body: JSON.stringify({ text: 'Another perspective here!' })
  });
  const d17 = await res17.json();
  const t17 = res17.status === 201 && d17.commentCount === 2;
  console.log(`17. Comment count increments: ${t17 ? '✅ PASS' : '❌ FAIL'} (New count: ${d17.commentCount})`);

  // Test 18: Username comes from authenticated user
  const t18 = d17.comment.username === 'bob_m' && d17.comment.userId === dataU2.user.id;
  console.log(`18. Comment username from req.user: ${t18 ? '✅ PASS' : '❌ FAIL'} (Author username: ${d17.comment.username})`);

  // Test 19: Unauthenticated comment -> 401
  const res19 = await fetch(`${BASE_URL}/api/posts/${textPostId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Anonymous comment' })
  });
  const d19 = await res19.json();
  const t19 = res19.status === 401 && d19.success === false;
  console.log(`19. Unauthenticated comment rejected: ${t19 ? '✅ PASS' : '❌ FAIL'} (Status: ${res19.status})`);

  // ----------------------------------------------------------------
  // SINGLE POST TESTS (20 to 22)
  // ----------------------------------------------------------------
  console.log('\n--- SINGLE POST TESTS ---');

  // Test 20: Get valid post
  const res20 = await fetch(`${BASE_URL}/api/posts/${textPostId}`);
  const d20 = await res20.json();
  const t20 = res20.status === 200 && d20.success && d20.post._id === textPostId && d20.post.comments.length === 2;
  console.log(`20. Get valid post: ${t20 ? '✅ PASS' : '❌ FAIL'} (Comments embedded: ${d20.post?.comments?.length})`);

  // Test 21: Invalid ID -> proper error
  const res21 = await fetch(`${BASE_URL}/api/posts/not-a-valid-object-id`);
  const d21 = await res21.json();
  const t21 = res21.status === 400 && d21.success === false && d21.message.includes('Invalid');
  console.log(`21. Invalid ID handled: ${t21 ? '✅ PASS' : '❌ FAIL'} (Status: ${res21.status}, Message: "${d21.message}")`);

  // Test 22: Non-existent post -> 404
  const nonExistentId = new mongoose.Types.ObjectId();
  const res22 = await fetch(`${BASE_URL}/api/posts/${nonExistentId}`);
  const d22 = await res22.json();
  const t22 = res22.status === 404 && d22.success === false && d22.message.includes('not found');
  console.log(`22. Non-existent post 404: ${t22 ? '✅ PASS' : '❌ FAIL'} (Status: ${res22.status})`);

  // Verify MongoDB Collections
  console.log('\n--- DATABASE COLLECTIONS AUDIT ---');
  const collections = await mongoose.connection.db.listCollections().toArray();
  const colNames = collections.map(c => c.name).filter(n => !n.startsWith('system.'));
  console.log('Active MongoDB Collections:', colNames);
  const onlyTwoCollections = colNames.length === 2 && colNames.includes('users') && colNames.includes('posts');
  console.log(`Two-Collection Rule: ${onlyTwoCollections ? '✅ PASS (Strictly users & posts only)' : '❌ FAIL'}`);

  console.log('\n======================================================');
  const allPassed = t1 && t2 && t3 && t4 && t5 && t6 && t7 && t8 && t9 && t10 && t11 && t12 && t13 && t14 && t15 && t16 && t17 && t18 && t19 && t20 && t21 && t22 && onlyTwoCollections;
  console.log(`   ALL 22 TESTS: ${allPassed ? '✅ 100% PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
};

runTests().catch(err => {
  console.error('Fatal post test error:', err);
  process.exit(1);
});
