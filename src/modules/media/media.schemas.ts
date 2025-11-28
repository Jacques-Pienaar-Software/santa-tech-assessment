import { z } from "zod";

export const createMediaSchema = z.object({
  orgId: z.string().min(1, "Organisation ID is required"),
  title: z.string().min(1, "Title is required"),
  duration: z.string().min(1, "Duration is required"),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
