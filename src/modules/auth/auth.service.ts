import { auth } from "../../core/auth/auth";
import { ConflictError, UnauthorizedError } from "../../core/http/errors";
import { prisma } from "../../lib/prisma";
import { LoginInput, RegisterInput } from "./auth.schemas";

export class AuthService {
  async register(input: RegisterInput) {
    const { name, email, password, role } = input;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "name";

      throw new ConflictError(`${conflictField} already in use`);
    }

    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name,
      },
    });

    const userId = signUpResult.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        role: role,
      },
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });

    if (!response.ok) {
      let body: any = null;
      body = await response.json();

      throw new UnauthorizedError(body?.error ?? "Invalid email or password");
    }

    const token = response.headers.get("set-auth-token") || undefined;

    const data = (await response.json()) as {
      user: { id: string; email: string };
      session: unknown;
    };

    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedError("User not found");
    }

    return {
      token,
      user: dbUser,
    };
  }
}

export const authService = new AuthService();
