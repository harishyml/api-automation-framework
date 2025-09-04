const axios = require("axios");
const { baseURL } = require("../config/config");
const { withRetry } = require("../utils/retry");

const client = axios.create({ baseURL });

const getUsers = () => withRetry(() => client.get("/users"), "GET /users");
const getUser = (id) => withRetry(() => client.get(`/users/${id}`), `GET /users/${id}`);
const createUser = (data) => withRetry(() => client.post("/users", data), "POST /users");
const updateUser = (id, data) => withRetry(() => client.put(`/users/${id}`, data), `PUT /users/${id}`);
const patchUser = (id, data) => withRetry(() => client.patch(`/users/${id}`, data), `PATCH /users/${id}`);
const deleteUser = (id) => withRetry(() => client.delete(`/users/${id}`), `DELETE /users/${id}`);

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
