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
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Logged in" },
        },
      },
    },
    "/media": {
      get: {
        summary: "List current user media",
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Upload media",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string", enum: ["AUDIO", "VIDEO"] },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
  },
};

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { swaggerRouter };
