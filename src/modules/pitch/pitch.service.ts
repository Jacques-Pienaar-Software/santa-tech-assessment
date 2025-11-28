import { prisma } from "../../lib/prisma";
import { AuthedUser } from "../../middleware/authGuard";
import { AppError } from "../../core/http/errors";
import { CreatePitchInput, UpdatePitchInput } from "./pitch.schema";

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

  async getPitchesForUserTargets(user: AuthedUser) {
    const pitches = await prisma.pitch.findMany({
      where: {
        targetAuthors: {
          some: {
            targetUserId: user.id,
          },
        },
      },
      include: {
        media: {
          select: {
            id: true,
            title: true,
            duration: true,
            filePath: true,
            orgId: true,
            createdAt: true,
          },
        },
        tags: true,
        targetAuthors: true,
        commentor: {
          include: {
            user: true,
            organisation: true,
          },
        },
      },
    });

    return pitches;
  }
  async updatePitch(
    pitchId: string,
    input: UpdatePitchInput,
    user: AuthedUser
  ) {
    const existing = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: {
        media: {
          select: {
            id: true,
            orgId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new AppError("Pitch not found", 404);
    }

    const membership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: existing.media.orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        "You are not a member of the organisation that owns this pitch",
        403
      );
    }

    const hasDescription = input.description !== undefined;
    const hasTags = input.tags !== undefined;

    const updated = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        description: hasDescription ? input.description : undefined,
        ...(hasTags && {
          tags: {
            deleteMany: {},
            create: (input.tags ?? []).map((tagValue) => ({ tagValue })),
          },
        }),
      },
      include: {
        tags: true,
        targetAuthors: true,
        media: true,
      },
    });

    return updated;
  }

  async deletePitch(pitchId: string, user: AuthedUser) {
    const existing = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: {
        media: {
          select: {
            id: true,
            orgId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new AppError("Pitch not found", 404);
    }

    const membership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: existing.media.orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        "You are not a member of the organisation that owns this pitch",
        403
      );
    }

    await prisma.pitchTags.deleteMany({
      where: {
        pitchId,
      },
    });

    await prisma.pitchTargetAuthor.deleteMany({
      where: {
        pitchId,
      },
    });

    await prisma.pitch.delete({
      where: { id: pitchId },
    });

    return { success: true };
  }
}

export const pitchService = new PitchService();
