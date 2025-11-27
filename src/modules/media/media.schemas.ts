import { z } from "zod";

export const createMediaSchema = z.object({
  title: z.string().min(1).optional(),
  duration: z.string(),
  filePath: z.string(),
  orgId: z.string().min(1),
});
