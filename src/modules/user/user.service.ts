import { prisma } from "../../lib/prisma";
import { AuthedUser } from "../../middleware/authGuard";
import { AppError } from "../../core/http/errors";

export class UserService {
  async getProfile(user: AuthedUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organisationMembership: {
          include: {
            organisation: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new AppError("User not found", 404);
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
      organisations: dbUser.organisationMembership.map((m) => ({
        id: m.organisation.id,
        name: m.organisation.name,
        createdAt: m.organisation.createdAt,
      })),
    };
  }
}

export const userService = new UserService();
