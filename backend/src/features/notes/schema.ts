import { z } from "zod";

// Security limits
const MAX_TITLE_LENGTH = 500;
const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB in bytes (as string)
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

export const createNoteSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH, "Title too long").optional(),
  content: z
    .string()
    .max(
      MAX_CONTENT_SIZE,
      `Content too large (max ${MAX_CONTENT_SIZE / 1024 / 1024}MB)`,
    )
    .optional()
    .nullable(), // Allow null/undefined
  category: z.string().nullable().optional(), // ObjectId as string or null
  tags: z
    .array(z.string().max(MAX_TAG_LENGTH, "Tag too long"))
    .max(MAX_TAGS, `Maximum ${MAX_TAGS} tags allowed`)
    .optional(),
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
