import { z } from "zod";

export const createPitchSchema = z.object({
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string().min(1)).optional().default([]),
  targetAuthors: z
    .array(
      z.object({
        mediaId: z.string().min(1, "mediaId is required"),
        targetUserId: z.string().min(1, "targetUserId is required"),
        targetOrgId: z.string().min(1, "targetOrgId is required"),
      })
    )
    .optional()
    .default([]),
});

export type CreatePitchInput = z.infer<typeof createPitchSchema>;

export const updatePitchSchema = z
  .object({
    description: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => data.description !== undefined || data.tags !== undefined, {
    message: "At least one of description or tags must be provided",
    path: ["description"],
  });

export type UpdatePitchInput = z.infer<typeof updatePitchSchema>;
