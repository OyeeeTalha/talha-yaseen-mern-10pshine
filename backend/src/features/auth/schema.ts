import { z } from "zod";

export const userAuthSchema = z.object({
  googleId: z.string().min(1, "Google ID is required"),
  email: z.email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
});

export type UserAuthInput = z.infer<typeof userAuthSchema>;
