import { z } from "zod";

export const generateShareLinkSchema = z.object({
  accessLevel: z.enum(["readonly", "edit"]),
});

export const updateCollaboratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  accessLevel: z.enum(["readonly", "edit"]),
});
