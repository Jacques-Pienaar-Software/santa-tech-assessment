import { z } from "zod";

export const createOrganisationSchema = z.object({
  name: z.string().min(3, "Organisation name must be at least 3 characters"),
});

export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;

export const addOrganisationManagerSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type AddOrganisationManagerInput = z.infer<
  typeof addOrganisationManagerSchema
>;

export const inviteSongwriterSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type InviteSongwriterInput = z.infer<typeof inviteSongwriterSchema>;

export const respondToInviteSchema = z.object({
  decision: z.enum(["ACCEPT", "REJECT"]),
});
export type RespondToInviteInput = z.infer<typeof respondToInviteSchema>;
