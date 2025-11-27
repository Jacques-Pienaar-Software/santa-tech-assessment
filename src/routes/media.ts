import { Router } from "express";
import path from "path";
import { prisma } from "../lib/prisma";
import { upload } from "../modules/media/upload";
import { authGuard, AuthedRequest } from "../middleware/authGuard";
import { CreateMediaRequest } from "./types/mediaRequests";

export const mediaRouter = Router();

mediaRouter.post(
  "/",
  authGuard,
  upload.single("file"),
  async (req: CreateMediaRequest, res) => {
    //TODO: Extract metadata with util before creating media item
    //TODO: Extract logic to a service method
    try {
      const file = req.file;
      const { title, duration, orgId } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!orgId) {
        return res.status(400).json({
          error: "orgId is required to attach media to an organisation",
        });
      }

      const media = await prisma.media.create({
        data: {
          title: title || file.originalname,
          filePath: path.basename(file.path),
          duration: duration,
          orgId,
        },
      });

      res.status(201).json(media);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to upload media" });
    }
  }
);

mediaRouter.get("/", authGuard, async (req: AuthedRequest, res) => {
  const { orgId } = req.query;

  if (!orgId) {
    return res.status(400).json({ error: "orgId query parameter is required" });
  }

  const media = await prisma.media.findMany({
    where: { orgId: String(orgId) },
  });
  res.json(media);
});
