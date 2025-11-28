import { z } from "zod";

export const createOrganisationSchema = z.object({
  name: z.string().min(3, "Organisation name must be at least 3 characters"),
});

export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;
