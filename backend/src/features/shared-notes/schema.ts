import { z } from "zod";

export const generateShareLinkSchema = z.object({
  accessLevel: z.enum(["readonly", "edit"]),
});

export const addCollaboratorSchema = z.object({
  email: z.string().email(),
  accessLevel: z.enum(["readonly", "edit"]),
});
