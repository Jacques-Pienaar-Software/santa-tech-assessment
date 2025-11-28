import { Router, Response, NextFunction } from "express";
import {
  AuthedRequest,
  authGuard,
  requireManager,
} from "../middleware/authGuard";
import { AppError } from "../core/http/errors";

import {
  createPitchSchema,
  updatePitchSchema,
} from "../modules/pitch/pitch.schema";
import { pitchService } from "../modules/pitch/pitch.service";

export const pitchRouter = Router();

pitchRouter.post(
  "/:mediaId/pitches",
  authGuard,
  requireManager,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { mediaId } = req.params;

      const parsed = createPitchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const pitch = await pitchService.createPitchForMedia(
        mediaId,
        parsed.data,
        req.user
      );

      return res.status(201).json(pitch);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Create pitch error", err);
      return res.status(500).json({ error: "Failed to create pitch" });
    }
  }
);

pitchRouter.get(
  "/pitches",
  authGuard,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const pitches = await pitchService.getPitchesForUserTargets(req.user);

      return res.status(200).json(pitches);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Get pitches for user error", err);
      return res.status(500).json({ error: "Failed to load pitches" });
    }
  }
);

pitchRouter.patch(
  "/pitches/:pitchId",
  authGuard,
  requireManager,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { pitchId } = req.params;

      const parsed = updatePitchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updatedPitch = await pitchService.updatePitch(
        pitchId,
        parsed.data,
        req.user
      );

      return res.status(200).json(updatedPitch);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Update pitch error", err);
      return res.status(500).json({ error: "Failed to update pitch" });
    }
  }
);

pitchRouter.delete(
  "/pitches/:pitchId",
  authGuard,
  requireManager,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { pitchId } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await pitchService.deletePitch(pitchId, req.user);

      return res.status(200).json(result);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Delete pitch error", err);
      return res.status(500).json({ error: "Failed to delete pitch" });
    }
  }
);
