const { validateSchema } = require("../utils/schemaValidator");
const { maxResponseTime, logErrors } = require("../config/config");

// Validate headers
const validateHeaders = (headers) => {
  expect(headers).toHaveProperty("content-type");
  expect(headers["content-type"]).toContain("application/json");
  expect(headers).toHaveProperty("cache-control");
};

// Validate response time
const validateResponseTime = (res, maxTime = maxResponseTime) => {
  expect(res.duration).toBeLessThan(maxTime);
};

// Generic request helper
const sendRequest = async (apiFn, schema, ...args) => {
  const start = Date.now();
  try {
    const res = await apiFn(...args);
    res.duration = Date.now() - start;

    validateHeaders(res.headers);
    validateResponseTime(res);

    if (schema && res.data && !(typeof res.data === "object" && Object.keys(res.data).length === 0)) {
      if (Array.isArray(res.data)) {
        res.data.forEach(item => validateSchema(item, schema));
      } else {
        validateSchema(res.data, schema);
      }
    }

    return res;
  } catch (error) {
    if (logErrors) {   // <-- use config's logErrors
      if (error.response) {
        console.error(
          `API Error: ${error.response.status} ${error.response.statusText}\n`,
          error.response.data
        );
      } else {
        console.error('API Error:', error.message);
      }
    }
    throw error;
  }
};

module.exports = { sendRequest, validateHeaders, validateResponseTime };
