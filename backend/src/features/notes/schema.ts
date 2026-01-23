import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().optional(),
  content: z.any().optional(), // Allow flexible content for BlockNote
  category: z.string().nullable().optional(), // ObjectId as string or null
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export const updateNoteSchema = createNoteSchema.extend({
  isTrash: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});
