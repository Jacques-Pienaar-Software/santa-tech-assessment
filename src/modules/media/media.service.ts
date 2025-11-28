import { AppError } from "../../core/http/errors";
import { prisma } from "../../lib/prisma";
import { AuthedUser } from "../../middleware/authGuard";
import { CreateMediaInput } from "./media.schemas";

export class MediaService {
  async createMediaForOrg(
    input: CreateMediaInput,
    user: AuthedUser,
    filePath: string
  ) {
    const membership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: input.orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError("You are not a member of this organisation", 403);
    }

    const media = await prisma.media.create({
      data: {
        title: input.title,
        duration: input.duration,
        filePath,
        orgId: input.orgId,
        authors: {
          create: {
            userId: user.id,
            orgId: input.orgId,
          },
        },
      },
      include: {
        authors: true,
      },
    });

    return media;
  }
  async listMediaForUser(userId: string) {
    const memberships = await prisma.organisationMember.findMany({
      where: { userId },
      select: { orgId: true },
    });

    const orgIds = memberships.map((m) => m.orgId);

    if (!orgIds.length) return [];

    const media = await prisma.media.findMany({
      where: {
        orgId: { in: orgIds },
      },
      include: {
        authors: {
          include: {
            member: {
              include: { user: true },
            },
          },
        },
        org: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return media;
  }
}

export const mediaService = new MediaService();
