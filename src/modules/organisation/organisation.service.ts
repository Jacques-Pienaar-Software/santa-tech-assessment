import {
  CreateOrganisationInput,
  AddOrganisationManagerInput,
  InviteSongwriterInput,
  RespondToInviteInput,
} from "./organisation.schemas";
import {
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from "../../core/http/errors";
import { AuthedUser } from "../../middleware/authGuard";
import { prisma } from "../../lib/prisma";

export class OrganisationService {
  async createOrganisation(input: CreateOrganisationInput, user: AuthedUser) {
    const organisation = await prisma.organisation.create({
      data: {
        name: input.name,
        members: {
          create: {
            user: {
              connect: { id: user.id },
            },
          },
        },
      },
      include: {
        members: true,
      },
    });

    return organisation;
  }

  async addManagerToOrganisation(
    orgId: string,
    input: AddOrganisationManagerInput,
    currentUser: AuthedUser
  ) {
    const { email } = input;

    const organisation = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { id: true },
    });

    if (!organisation) {
      throw new BadRequestError("Organisation not found");
    }

    const currentMembership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: currentUser.id,
          orgId,
        },
      },
    });

    if (!currentMembership) {
      throw new ForbiddenError(
        "You must be a member of this organisation to add managers"
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!targetUser) {
      throw new BadRequestError("Target user not found");
    }

    if (targetUser.role !== "MANAGER") {
      throw new ForbiddenError("Target user must be a MANAGER");
    }

    const existingMembership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: targetUser.id,
          orgId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictError("User is already a member of this organisation");
    }

    const membership = await prisma.organisationMember.create({
      data: {
        userId: targetUser.id,
        orgId,
      },
      include: {
        user: true,
        organisation: true,
      },
    });

    return membership;
  }

  async inviteSongwriterToOrganisation(
    orgId: string,
    input: InviteSongwriterInput,
    currentUser: AuthedUser
  ) {
    const { email } = input;

    const organisation = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { id: true },
    });

    if (!organisation) {
      throw new BadRequestError("Organisation not found");
    }

    const currentMembership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: currentUser.id,
          orgId,
        },
      },
    });

    if (!currentMembership) {
      throw new ForbiddenError(
        "You must be a member of this organisation to invite songwriters"
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!targetUser) {
      throw new BadRequestError("Target user not found");
    }

    if (targetUser.role !== "SONGWRITER") {
      throw new ForbiddenError("Target user must be a SONGWRITER");
    }

    const existingMembership = await prisma.organisationMember.findUnique({
      where: {
        userId_orgId: {
          userId: targetUser.id,
          orgId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictError("User is already a member of this organisation");
    }

    const existingInvite = await prisma.organisationInvite.findFirst({
      where: {
        orgId,
        inviteeId: targetUser.id,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      throw new ConflictError(
        "User already has a pending invite to this organisation"
      );
    }

    const invite = await prisma.organisationInvite.create({
      data: {
        orgId,
        inviterId: currentUser.id,
        inviteeId: targetUser.id,
        role: "SONGWRITER",
      },
      include: {
        org: true,
        inviter: true,
        invitee: true,
      },
    });

    return invite;
  }

  async listMyInvites(currentUser: AuthedUser) {
    const invites = await prisma.organisationInvite.findMany({
      where: {
        inviteeId: currentUser.id,
        status: "PENDING",
      },
      include: {
        org: true,
        inviter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invites;
  }

  async respondToInvite(
    inviteId: string,
    input: RespondToInviteInput,
    currentUser: AuthedUser
  ) {
    const { decision } = input;

    const invite = await prisma.organisationInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new BadRequestError("Invite not found");
    }

    if (invite.inviteeId !== currentUser.id) {
      throw new ForbiddenError("You are not the invitee for this invitation");
    }

    if (invite.status !== "PENDING") {
      throw new ConflictError("This invite has already been responded to");
    }

    if (decision === "ACCEPT") {
      const existingMembership = await prisma.organisationMember.findUnique({
        where: {
          userId_orgId: {
            userId: currentUser.id,
            orgId: invite.orgId,
          },
        },
      });

      if (!existingMembership) {
        await prisma.organisationMember.create({
          data: {
            userId: currentUser.id,
            orgId: invite.orgId,
          },
        });
      }

      const updatedInvite = await prisma.organisationInvite.update({
        where: { id: inviteId },
        data: {
          status: "ACCEPT",
          respondedAt: new Date(),
        },
      });

      return updatedInvite;
    } else {
      const updatedInvite = await prisma.organisationInvite.update({
        where: { id: inviteId },
        data: {
          status: "REJECT",
          respondedAt: new Date(),
        },
      });

      return updatedInvite;
    }
  }
}
export const organisationService = new OrganisationService();
