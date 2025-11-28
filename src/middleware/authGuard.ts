import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../core/auth/auth";

export interface AuthedUser {
  id: string;
  email: string;
  username: string | null;
  role: "SONGWRITER" | "MANAGER";
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

export const authGuard = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.name,
      role: dbUser.role,
    };

    next();
  } catch (err) {
    console.error("authGuard error", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireManager = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "MANAGER") {
    return res.status(403).json({ error: "Managers only" });
  }
  next();
};
