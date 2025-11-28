import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name must be at least 1 character"),
  role: z.enum(["SONGWRITER", "MANAGER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
