import { Schema, model, InferSchemaType } from "mongoose";

const notesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: "Untitled Note",
      trim: true,
    },
    content: {
      type: String,
      required: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    tags: {
      type: [String],
      required: false,
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isTrash: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
export type Note = InferSchemaType<typeof notesSchema>;
export const NoteModel = model<Note>("Note", notesSchema);
