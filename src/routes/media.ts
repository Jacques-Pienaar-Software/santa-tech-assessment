import { Router, Response, NextFunction } from "express";
import { AuthedRequest, authGuard } from "../middleware/authGuard";
import { AppError } from "../core/http/errors";
import { createMediaSchema } from "../modules/media/media.schemas";
import { mediaService } from "../modules/media/media.service";
import { mediaUpload } from "../modules/media/upload";

export const mediaRouter = Router();

mediaRouter.post(
  "/",
  authGuard,
  mediaUpload.single("file"),
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createMediaSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: "File is required under the 'file' field" });
      }

      const relativePath = `uploads/media/${req.file.filename}`;

      const media = await mediaService.createMediaForOrg(
        parsed.data,
        req.user,
        relativePath
      );

      return res.status(201).json(media);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Create media error", err);
      return res.status(500).json({ error: "Failed to upload media" });
    }
  }
);
