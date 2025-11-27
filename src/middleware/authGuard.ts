import { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

export const authGuard = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.substring("Bearer ".length);

    const user = { id: "example-id", email: "demo@example.com" };

    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
