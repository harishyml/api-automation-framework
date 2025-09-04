const { getUsers, getUser, createUser, updateUser, patchUser, deleteUser } = require("../clients/userClients");
const validUsers = require("../data/users.json");
const updateUserData = require("../data/updateUser.json");
const { sendRequest } = require("../common/testHelpers");
const { userSchema } = require("../utils/schemaValidator");
const { withRetry, createFlakyFunction } = require("../utils/retry");

describe("Users API Endpoints", () => {
  let createdUserIds = [];

  // GET all users
  test("Get all users", async () => {
    const res = await sendRequest(getUsers, userSchema);
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
  });

  // GET user by ID (positive)
  test.each([1, 2, 3])("Get user by ID %i", async (id) => {
    const res = await sendRequest(getUser, userSchema, id);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(id);
  });

  // GET non-existent user (negative)
  test("Get non-existent user returns 404", async () => {
    await expect(sendRequest(getUser, null, 9999)).rejects.toHaveProperty("response.status", 404);
  });

  // CREATE users
  test.each(validUsers)("Create user", async (user) => {
    const res = await sendRequest(createUser, userSchema, user);
    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.name).toBe(user.name);
    createdUserIds.push(res.data.id);
  });

  // UPDATE user fully (PUT)
  test("Update user fully", async () => {
    const res = await sendRequest(updateUser, userSchema, 1, updateUserData);
    expect(res.status).toBe(200);
    expect(res.data.name).toBe(updateUserData.name);
    expect(res.data.username).toBe(updateUserData.username);
    expect(res.data.email).toBe(updateUserData.email);
  });

  // PATCH user partially
  test("Patch user partially", async () => {
    const patchData = { name: "Patched Name", username: "patchedUser" };
    const res = await sendRequest(patchUser, userSchema, 1, { ...updateUserData, ...patchData });
    expect(res.status).toBe(200);
    expect(res.data.name).toBe(patchData.name);
    expect(res.data.username).toBe(patchData.username);
  });

  // DELETE user (create → delete → verify 404)
  test("Create and delete user, verify 404", async () => {
    const createRes = await sendRequest(createUser, null, validUsers[0]);
    const userId = createRes.data.id;

    const deleteRes = await sendRequest(deleteUser, null, userId);
    expect(deleteRes.status).toBe(200);

    await expect(sendRequest(getUser, null, userId)).rejects.toHaveProperty("response.status", 404);
  });

  // Retry coverage example (forced failure)
test("Retry test: fails twice, succeeds third attempt", async () => {
  const flakyFn = createFlakyFunction(2, { success: true });
  const result = await withRetry(flakyFn, "Flaky Function Test");
  expect(result.data.success).toBe(true);
});

  // Cleanup created users
  afterAll(async () => {
    for (const id of createdUserIds) {
      await sendRequest(deleteUser, null, id).catch(() => {});
    }
  });
});
