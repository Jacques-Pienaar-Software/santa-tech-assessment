import { Router, Response, NextFunction } from "express";
import { AuthedRequest, authGuard } from "../middleware/authGuard";
import { AppError } from "../core/http/errors";
import { userService } from "../modules/user/user.service";

export const profileRouter = Router();

profileRouter.get(
  "/",
  authGuard,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profile = await userService.getProfile(req.user);

      return res.status(200).json(profile);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error("Get profile error", err);
      return res.status(500).json({ error: "Failed to load profile" });
    }
  }
);
