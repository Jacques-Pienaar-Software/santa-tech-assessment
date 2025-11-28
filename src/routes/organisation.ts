import { Router, Response, NextFunction } from "express";
import {
  AuthedRequest,
  authGuard,
  requireManager,
} from "../middleware/authGuard";
import {
  addOrganisationManagerSchema,
  createOrganisationSchema,
  inviteSongwriterSchema,
  respondToInviteSchema,
} from "../modules/organisation/organisation.schemas";
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

organisationRouter.post(
  "/:orgId/managers",
  authGuard,
  requireManager,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;

      const parsed = addOrganisationManagerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const membership = await organisationService.addManagerToOrganisation(
        orgId,
        parsed.data,
        req.user
      );

      return res.status(201).json(membership);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Add organisation manager error", err);
      return res
        .status(500)
        .json({ error: "Failed to add manager to organisation" });
    }
  }
);

organisationRouter.post(
  "/:orgId/invites",
  authGuard,
  requireManager,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;

      const parsed = inviteSongwriterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const invite = await organisationService.inviteSongwriterToOrganisation(
        orgId,
        parsed.data,
        req.user
      );

      return res.status(201).json(invite);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Invite songwriter error", err);
      return res.status(500).json({ error: "Failed to invite songwriter" });
    }
  }
);

organisationRouter.get(
  "/invites",
  authGuard,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const invites = await organisationService.listMyInvites(req.user);

      return res.status(200).json(invites);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("List invites error", err);
      return res.status(500).json({ error: "Failed to list invites" });
    }
  }
);

organisationRouter.post(
  "/invites/:inviteId/respond",
  authGuard,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { inviteId } = req.params;

      const parsed = respondToInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const invite = await organisationService.respondToInvite(
        inviteId,
        parsed.data,
        req.user
      );

      return res.status(200).json(invite);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Respond invite error", err);
      return res.status(500).json({ error: "Failed to respond to invite" });
    }
  }
);
