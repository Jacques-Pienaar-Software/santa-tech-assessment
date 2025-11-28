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

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        description:
          "Creates a user account with a specific role (MANAGER or SONGWRITER).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password", "role"],
                properties: {
                  username: {
                    type: "string",
                    minLength: 3,
                    maxLength: 32,
                    pattern: "^[a-zA-Z0-9_]+$",
                  },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  role: {
                    type: "string",
                    enum: ["SONGWRITER", "MANAGER"],
                    description:
                      "Determines what the user can do in the app (permissions).",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User successfully registered" },
          "400": { description: "Invalid input (schema validation failed)" },
          "409": { description: "Email or username already exists" },
          "500": { description: "Server error" },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login with email and password",
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
          "200": {
            description: "Logged in successfully (returns token + user)",
          },
          "400": { description: "Invalid input" },
          "401": { description: "Invalid email or password" },
        },
      },
    },

    "/media": {
      get: {
        summary: "List media for the current user / organisation",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Media list returned" },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Upload media",
        description:
          "Uploads a media file (MP3/MP4) and associates it with an organisation.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "orgId"],
                properties: {
                  title: {
                    type: "string",
                    description:
                      "Optional title. If omitted, the original filename is used.",
                  },
                  orgId: {
                    type: "string",
                    description: "ID of the organisation the media belongs to.",
                  },
                  duration: {
                    type: "string",
                    description: "Duration as a string (e.g. '03:45').",
                  },
                  file: {
                    type: "string",
                    format: "binary",
                    description: "The media file (audio/video).",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Media created" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    "/organisations": {
      post: {
        summary: "Create an organisation (MANAGER only)",
        description:
          "Creates a new organisation and automatically adds the current MANAGER as a member.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 3,
                    maxLength: 100,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Organisation created" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
          "403": { description: "Managers only" },
        },
      },
    },
  },
};

swaggerRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

export { swaggerRouter };
