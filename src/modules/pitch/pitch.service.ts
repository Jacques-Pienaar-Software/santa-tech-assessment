import { prisma } from "../../lib/prisma";
import { AuthedUser } from "../../middleware/authGuard";
import { AppError } from "../../core/http/errors";
import { CreatePitchInput } from "./pitch.schema";

export class PitchService {
  async createPitchForMedia(
    mediaId: string,
    input: CreatePitchInput,
    user: AuthedUser
  ) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        orgId: true,
      },
    });

    if (!media) {
      throw new AppError("Media not found", 404);
    }

    const membership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: media.orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        "You are not a member of the organisation that owns this media",
        403
      );
    }

    const targetAuthors = input.targetAuthors ?? [];
    const invalidTarget = targetAuthors.find((t) => t.mediaId !== media.id);
    if (invalidTarget) {
      throw new AppError(
        "All targetAuthors.mediaId must match the mediaId in the path",
        400
      );
    }

    const pitch = await prisma.pitch.create({
      data: {
        mediaId: media.id,
        authorUserId: user.id,
        authorOrgId: media.orgId,
        description: input.description,
        tags:
          input.tags && input.tags.length
            ? {
                create: input.tags.map((tagValue) => ({ tagValue })),
              }
            : undefined,
        targetAuthors:
          targetAuthors.length > 0
            ? {
                create: targetAuthors.map((t) => ({
                  mediaId: t.mediaId,
                  targetUserId: t.targetUserId,
                  targetOrgId: t.targetOrgId,
                })),
              }
            : undefined,
      },
      include: {
        tags: true,
        targetAuthors: true,
      },
    });

    return pitch;
  }
}

export const pitchService = new PitchService();
