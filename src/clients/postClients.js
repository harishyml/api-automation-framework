const axios = require("axios");
const { baseURL } = require("../config/config");
const { withRetry } = require("../utils/retry");

const client = axios.create({ baseURL });

const getPosts = () => withRetry(() => client.get("/posts"), "GET /posts");
const getPost = (id) => withRetry(() => client.get(`/posts/${id}`), `GET /posts/${id}`);
const createPost = (data) => withRetry(() => client.post("/posts", data), "POST /posts");
const updatePost = (id, data) => withRetry(() => client.put(`/posts/${id}`, data), `PUT /posts/${id}`);
const patchPost = (id, data) => withRetry(() => client.patch(`/posts/${id}`, data), `PATCH /posts/${id}`);
const deletePost = (id) => withRetry(() => client.delete(`/posts/${id}`), `DELETE /posts/${id}`);

module.exports = { getPosts, getPost, createPost, updatePost, patchPost, deletePost };
