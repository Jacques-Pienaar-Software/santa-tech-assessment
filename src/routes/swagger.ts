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
        bearerFormat: "Session", // or "JWT" if you prefer
      },
    },
  },

  paths: {
    // ---------- AUTH ----------
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
                required: ["name", "email", "password", "role"],
                properties: {
                  name: {
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
          "409": { description: "Email or name already exists" },
          "500": { description: "Server error" },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login with email and password",
        description:
          "Logs in a user and returns a bearer token plus user details (including role).",
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

    // ---------- MEDIA ----------
    "/media": {
      get: {
        summary: "List media for the current user",
        description:
          "Returns all media belonging to organisations where the current user is a member.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Media list returned" },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Upload media",
        description:
          "Uploads a media file (MP3/MP4/WAV) and associates it with an organisation. The uploader must be a member of the organisation and is automatically added as a MediaAuthor for the new media.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "orgId", "title", "duration"],
                properties: {
                  title: {
                    type: "string",
                    description: "Title of the track.",
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
                    description:
                      "The media file (audio/video). Only MP3, WAV, and MP4 are accepted.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Media created" },
          "400": { description: "Invalid input or file missing/invalid" },
          "401": { description: "Unauthorized" },
          "403": {
            description:
              "User is not a member of the specified organisation and cannot upload media to it.",
          },
        },
      },
    },

    // ---------- ORGANISATIONS ----------
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

    "/organisations/{orgId}/managers": {
      post: {
        summary: "Add a MANAGER to an organisation (MANAGER only)",
        description:
          "Adds an existing MANAGER user (by email) as a member of the organisation. Caller must be a MANAGER and member of this organisation.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "orgId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the organisation",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email of the MANAGER user to add",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Manager added to organisation" },
          "400": { description: "Invalid input or organisation not found" },
          "401": { description: "Unauthorized" },
          "403": {
            description:
              "Caller must be a MANAGER and member of the organisation; target user must be MANAGER",
          },
          "409": {
            description: "User is already a member of this organisation",
          },
        },
      },
    },

    // ---------- NEW: INVITES ----------
    "/organisations/{orgId}/invites": {
      post: {
        summary: "Invite a SONGWRITER to an organisation (MANAGER only)",
        description:
          "Sends an invite to an existing SONGWRITER user to join the organisation. Caller must be a MANAGER and member of this organisation.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "orgId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the organisation",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email of the SONGWRITER to invite",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Invite created" },
          "400": { description: "Invalid input or organisation not found" },
          "401": { description: "Unauthorized" },
          "403": {
            description:
              "Caller must be a MANAGER and member of the organisation; target user must be SONGWRITER",
          },
          "409": {
            description:
              "User already has a pending invite or is already a member",
          },
        },
      },
    },

    "/organisations/invites": {
      get: {
        summary: "List pending organisation invites for the current user",
        description:
          "Returns all PENDING invites where the current user is the invitee.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of pending invites" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    "/organisations/invites/{inviteId}/respond": {
      post: {
        summary: "Respond to an organisation invite",
        description:
          "ACCEPT or REJECT an invite. On ACCEPT, the user becomes an organisation member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "inviteId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the invite",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["decision"],
                properties: {
                  decision: {
                    type: "string",
                    enum: ["ACCEPT", "REJECT"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Invite updated. If ACCEPT, membership created (if needed).",
          },
          "400": { description: "Invalid input or invite not found" },
          "401": { description: "Unauthorized" },
          "403": {
            description: "Current user is not the invitee for this invite",
          },
          "409": {
            description: "Invite has already been responded to",
          },
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
