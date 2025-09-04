const { getPosts, getPost, createPost, updatePost, patchPost, deletePost } = require("../clients/postClients");
const validPosts = require("../data/posts.json");
const updatePostData = require("../data/updatePost.json");
const { sendRequest } = require("../common/testHelpers");
const { postSchema } = require("../utils/schemaValidator");
const { withRetry, createFlakyFunction } = require("../utils/retry");

describe("Posts API Endpoints", () => {
  let createdPostIds = [];
  

  // GET all posts
  test("Get all posts", async () => {
    const res = await sendRequest(getPosts, postSchema);
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
  });

  // GET post by ID (positive)
  test.each([1, 2, 3])("Get post by ID %i", async (id) => {
    const res = await sendRequest(getPost, postSchema, id);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(id);
  });

  // GET non-existent post (negative)
  test("Get non-existent post returns 404", async () => {
    await expect(sendRequest(getPost, null, 9999)).rejects.toHaveProperty("response.status", 404);
  });

  // CREATE posts
  test.each(validPosts)("Create post", async (post) => {
    const res = await sendRequest(createPost, postSchema, post);
    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.title).toBe(post.title);
    createdPostIds.push(res.data.id);
  });

  // UPDATE post fully (PUT)
  test("Update post fully", async () => {
    const res = await sendRequest(updatePost, postSchema, 1, updatePostData);
    expect(res.status).toBe(200);
    expect(res.data.title).toBe(updatePostData.title);
    expect(res.data.body).toBe(updatePostData.body);
    expect(res.data.userId).toBe(updatePostData.userId);
  });

  // PATCH post partially
  test("Patch post partially", async () => {
    const patchData = { title: "Patched Post Title" };
    const res = await sendRequest(patchPost, postSchema, 1, patchData);
    expect(res.status).toBe(200);
    expect(res.data.title).toBe(patchData.title);
  });

  // DELETE post (create → delete → verify 404)
  test("Create and delete post, verify 404", async () => {
    const createRes = await sendRequest(createPost, null, validPosts[0]);
    const postId = createRes.data.id;

    const deleteRes = await sendRequest(deletePost, null, postId);
    expect(deleteRes.status).toBe(200);

    await expect(sendRequest(getPost, null, postId)).rejects.toHaveProperty("response.status", 404);
  });

  // Retry coverage example (forced failure)
 test("Retry test: fails twice, succeeds third attempt", async () => {
  const flakyFn = createFlakyFunction(2, { success: true });
  const result = await withRetry(flakyFn, "Flaky Function Test");
  expect(result.data.success).toBe(true);
});

  // Cleanup created posts
  afterAll(async () => {
    for (const id of createdPostIds) {
      await sendRequest(deletePost, null, id).catch(() => {});
    }
  });
});
