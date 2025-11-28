import { auth } from "../../core/auth/auth";
import { ConflictError } from "../../core/http/errors";
import { prisma } from "../../lib/prisma";
import { RegisterInput } from "./auth.schemas";


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
      const conflictField =
        existingUser.email === email ? "email" : "name";

      throw new ConflictError(`${conflictField} already in use`);
    }


    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name, 
      }
    });

    const userId = signUpResult.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        role: role
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
}

export const authService = new AuthService();