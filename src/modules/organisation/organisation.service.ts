import { prisma } from "../../lib/prisma";
import { AuthedUser } from "../../middleware/authGuard";
import { CreateOrganisationInput } from "./organisation.schemas";

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
}

export const organisationService = new OrganisationService();
