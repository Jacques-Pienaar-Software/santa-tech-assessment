import { Router, Request, Response, NextFunction } from "express";
import { registerSchema } from "../modules/auth/auth.schemas";
import { authService } from "../modules/auth/auth.service";
import { AppError } from "../core/http/errors";

export const authRouter = Router();

authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parseResult.error.flatten()
        });
      }

      const meta = {
        headers: req.headers as Record<string, any>,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? "",
      };

      const result = await authService.register(parseResult.data);

      return res.status(201).json({
        description: "user created",
        result
      });
    } catch (err) {

      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }

      console.error("Unexpected registration error", err);
      return res.status(500).json({ error: "Failed to register user" });
    }
  }
);
