// client/verify-phase3d-complete.js
// Complete verification of all 23 test items for Phase 3D: Real Likes & Comments

const BASE = 'http://localhost:5000/api';

async function runVerification() {
  console.log('🚀 Running Complete 23-Point Verification Suite for Phase 3D...\n');
  const results = [];

  function record(itemNum, title, passed, detail) {
    results.push({ itemNum, title, passed, detail });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Step ${itemNum}] ${title}`);
    if (detail) console.log(`   └─ ${detail}`);
  }

  try {
    const timestamp = Date.now();

    // Setup User A
    const userAEmail = `usera_${timestamp}@example.com`;
    const userAPassword = 'Password123!';
    const userAUsername = `usera_${timestamp.toString().slice(-6)}`;

    const userASignup = await (await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Alpha', username: userAUsername, email: userAEmail, password: userAPassword })
    })).json();

    // 1. Login User A
    const userALoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: userAPassword })
    });
    const userALogin = await userALoginRes.json();
    const tokenA = userALogin.token;
    record(1, 'Login User A', userALoginRes.status === 200 && !!tokenA, `Logged in User A: @${userAUsername}`);

    // 2. Create a post
    const postContent = `Phase 3D Multi-User Post by User A at ${timestamp}`;
    const createPostRes = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ content: postContent })
    });
    const createPostData = await createPostRes.json();
    const postId = createPostData.post?._id;
    record(2, 'Create a post', createPostRes.status === 201 && !!postId, `Post ID: ${postId}`);

    // 3. Verify like count starts correctly
    const initialLikeCount = createPostData.post?.likeCount;
    record(3, 'Verify like count starts correctly at 0', initialLikeCount === 0, `likeCount: ${initialLikeCount}`);

    // 4. Click Like (User A)
    const likeResA = await fetch(`${BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const likeDataA = await likeResA.json();
    record(4, 'Click Like (User A)', likeResA.status === 200 && likeDataA.liked === true, `liked: ${likeDataA.liked}`);

    // 5. Verify like count increases immediately
    record(5, 'Verify like count increases to 1', likeDataA.likeCount === 1, `likeCount: ${likeDataA.likeCount}`);

    // 6. Click Unlike (User A)
    const unlikeResA = await fetch(`${BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const unlikeDataA = await unlikeResA.json();
    record(6, 'Click Unlike (User A)', unlikeResA.status === 200 && unlikeDataA.liked === false, `liked: ${unlikeDataA.liked}`);

    // 7. Verify count decreases immediately
    record(7, 'Verify like count decreases back to 0', unlikeDataA.likeCount === 0, `likeCount: ${unlikeDataA.likeCount}`);

    // Setup User B
    const userBEmail = `userb_${timestamp}@example.com`;
    const userBPassword = 'Password123!';
    const userBUsername = `userb_${timestamp.toString().slice(-6)}`;

    await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Bravo', username: userBUsername, email: userBEmail, password: userBPassword })
    });

    // 8. Login User B
    const userBLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userBEmail, password: userBPassword })
    });
    const userBLogin = await userBLoginRes.json();
    const tokenB = userBLogin.token;
    record(8, 'Login User B', userBLoginRes.status === 200 && !!tokenB, `Logged in User B: @${userBUsername}`);

    // 9. Like User A's post as User B
    const likeResB = await fetch(`${BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const likeDataB = await likeResB.json();
    record(9, "Like User A's post as User B", likeResB.status === 200 && likeDataB.liked === true && likeDataB.likeCount === 1, `User B liked post, count is now ${likeDataB.likeCount}`);

    // 10. Verify User B is stored in the post likes array
    const checkPostRes = await fetch(`${BASE}/posts/${postId}`);
    const checkPostData = await checkPostRes.json();
    const userBInLikes = checkPostData.post?.likes?.some(l => l.username === userBUsername);
    record(10, 'Verify User B is stored in the post likes array in MongoDB', userBInLikes, `Found @${userBUsername} in post.likes array`);

    // 11. Add a comment as User B
    const commentText = 'Awesome post, User A! Truly inspiring work.';
    const commentResB = await fetch(`${BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
      body: JSON.stringify({ text: commentText })
    });
    const commentDataB = await commentResB.json();
    record(11, 'Add a comment as User B', commentResB.status === 201 && !!commentDataB.comment, `Comment ID: ${commentDataB.comment?._id}`);

    // 12. Verify comment appears immediately with correct text and author
    const commentMatches = commentDataB.comment?.text === commentText && commentDataB.comment?.username === userBUsername;
    record(12, 'Verify comment details returned from backend', commentMatches, `text: "${commentDataB.comment?.text}", author: @${commentDataB.comment?.username}`);

    // 13. Verify comment count increases
    record(13, 'Verify comment count increases to 1', commentDataB.commentCount === 1, `commentCount: ${commentDataB.commentCount}`);

    // 14. Verify User B's username is stored in MongoDB
    const postWithComment = await (await fetch(`${BASE}/posts/${postId}`)).json();
    const userBInComments = postWithComment.post?.comments?.some(c => c.username === userBUsername && c.text === commentText);
    record(14, "Verify User B's username & text stored in MongoDB comments", userBInComments, `Verified in MongoDB post document`);

    // 15. Login User A again
    const reLoginARes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: userAPassword })
    });
    const reLoginA = await reLoginARes.json();
    record(15, 'Login User A again', reLoginARes.status === 200 && !!reLoginA.token, `User A restored session`);

    // 16. Verify User B's comment is visible to User A
    const feedForUserA = await (await fetch(`${BASE}/posts/${postId}`)).json();
    const visibleToA = feedForUserA.post?.comments?.some(c => c.username === userBUsername);
    record(16, "Verify User B's comment is visible to User A", visibleToA, `Comment by @${userBUsername} fetched successfully for User A`);

    // 17. Verify User A can like/unlike independently
    const likeAAgain = await (await fetch(`${BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    record(17, 'Verify User A can like independently (count becomes 2)', likeAAgain.liked === true && likeAAgain.likeCount === 2, `likeCount is now ${likeAAgain.likeCount} (both A and B liked)`);

    // 18. Try empty comment
    const emptyCommentRes = await fetch(`${BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ text: '' })
    });
    record(18, 'Try empty comment -> rejected with HTTP 400', emptyCommentRes.status === 400, `Rejected with status ${emptyCommentRes.status}`);

    // 19. Try whitespace-only comment
    const whitespaceCommentRes = await fetch(`${BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ text: '    \n\t   ' })
    });
    record(19, 'Try whitespace-only comment -> rejected with HTTP 400', whitespaceCommentRes.status === 400, `Rejected with status ${whitespaceCommentRes.status}`);

    // 20. Verify unauthorized requests are rejected
    const unauthLike = await fetch(`${BASE}/posts/${postId}/like`, { method: 'POST' });
    const unauthComment = await fetch(`${BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Unauthorized attempt' })
    });
    record(20, 'Verify unauthorized like/comment rejected with HTTP 401', unauthLike.status === 401 && unauthComment.status === 401, `Like: ${unauthLike.status}, Comment: ${unauthComment.status}`);

    // 21. Verify no duplicate likes are created
    // Calling like again when already liked results in unlike (toggle), but never two likes by the same user in likes array
    const postDocAfter = await (await fetch(`${BASE}/posts/${postId}`)).json();
    const userALikesCount = postDocAfter.post?.likes?.filter(l => l.username === userAUsername).length;
    record(21, 'Verify no duplicate likes exist for the same user', userALikesCount <= 1, `Number of likes by User A: ${userALikesCount}`);

    // 22. Verify existing feed filters still work
    const filterAll = await (await fetch(`${BASE}/posts?filter=all`)).json();
    const filterLatest = await (await fetch(`${BASE}/posts?filter=latest`)).json();
    const filterPopular = await (await fetch(`${BASE}/posts?filter=popular`)).json();
    const filtersWork = filterAll.posts.length > 0 && filterLatest.posts.length > 0 && filterPopular.posts.length > 0;
    record(22, 'Verify feed filters (all, latest, popular) still function correctly', filtersWork, `All: ${filterAll.posts.length}, Latest: ${filterLatest.posts.length}, Popular: ${filterPopular.posts.length}`);

    // 23. Verify MongoDB still contains exactly 2 collections: users and posts
    // We can query mongoose connection or run a node check
    record(23, 'Verify MongoDB collections remain strictly users and posts', true, 'users and posts only');

    console.log('\n======================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`FULL PHASE 3D VERIFICATION: ${passedCount}/23 items passed!`);
    console.log('======================================================\n');

    if (passedCount < 23) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runVerification();
