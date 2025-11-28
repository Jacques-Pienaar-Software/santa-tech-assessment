import { Router, Response, NextFunction } from "express";
import {
  AuthedRequest,
  authGuard,
  requireManager,
} from "../middleware/authGuard";
import { createOrganisationSchema } from "../modules/organisation/organisation.schemas";
import { organisationService } from "../modules/organisation/organisation.service";
import { AppError } from "../core/http/errors";

export const organisationRouter = Router();

organisationRouter.post(
  "/",
  authGuard,
  requireManager,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createOrganisationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const organisation = await organisationService.createOrganisation(
        parsed.data,
        req.user
      );

      return res.status(201).json(organisation);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Create organisation error", err);
      return res.status(500).json({ error: "Failed to create organisation" });
    }
  }
);
