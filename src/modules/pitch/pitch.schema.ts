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
