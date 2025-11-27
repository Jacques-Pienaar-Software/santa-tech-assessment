import z from "zod";
import { createMediaSchema } from "../../modules/media/media.schemas";

export type createMediaInput = z.infer<typeof createMediaSchema>;
