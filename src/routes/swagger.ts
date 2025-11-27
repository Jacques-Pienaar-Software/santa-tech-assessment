import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerRouter = Router();

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Media API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:3000" }],

  paths: {
    /** -------------------------
     *  AUTH
     *  ------------------------*/
    "/auth/register": {
      post: {
        summary: "Register a new user",
        description: "Creates a user account using email, username, and password.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: {
                    type: "string",
                    minLength: 3,
                    maxLength: 32,
                    pattern: "^[a-zA-Z0-9_]+$",
                  },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User successfully registered",
          },
          "400": {
            description: "Invalid input (schema validation failed)",
          },
          "409": {
            description: "Email or username already exists",
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login with email + password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Logged in successfully" },
          "401": { description: "Invalid email or password" },
          "400": { description: "Invalid input" },
        },
      },
    },

    /** -------------------------
     *  MEDIA
     *  ------------------------*/
    "/media": {
      get: {
        summary: "List current user's media",
        responses: {
          "200": { description: "Media list" },
          "401": { description: "Unauthorized (missing/inactive session)" },
        },
      },

      post: {
        summary: "Upload media file",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  title: { type: "string" },
                  orgId: { type: "string" },
                  duration: { type: "string" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Media uploaded successfully" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
        },
      },
    },
  },
};

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { swaggerRouter };
