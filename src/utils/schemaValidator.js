const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// User JSON Schema
const userSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        suite: { type: "string" },
        city: { type: "string" },
        zipcode: { type: "string" },
        geo: {
          type: "object",
          properties: {
            lat: { type: "string" },
            lng: { type: "string" },
          },
          required: ["lat", "lng"],
        },
      },
      required: ["street", "suite", "city", "zipcode", "geo"],
    },
    phone: { type: "string" },
    website: { type: "string" },
    company: {
      type: "object",
      properties: {
        name: { type: "string" },
        catchPhrase: { type: "string" },
        bs: { type: "string" },
      },
      required: ["name", "catchPhrase", "bs"],
    },
  },
  required: ["id", "name", "username", "email", "address", "phone", "website", "company"],
};

// Post JSON Schema
const postSchema = {
  type: "object",
  properties: {
    userId: { type: "number" },
    id: { type: "number" },
    title: { type: "string" },
    body: { type: "string" },
  },
  required: ["userId", "id", "title", "body"],
};

// Generic schema validator
function validateSchema(data, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const errorMsg = validate.errors.map((e) => `${e.instancePath} ${e.message}`).join(", ");
    throw new Error(`Schema validation failed: ${errorMsg}`);
  }
}

module.exports = { validateSchema, userSchema, postSchema };
