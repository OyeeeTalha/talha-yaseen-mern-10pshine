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
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isTrash: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Number, // Unix timestamp in seconds
      required: false,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        firstEditedAt: {
          type: Date,
          default: Date.now,
        },
        lastEditedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

  },
  {
    timestamps: true,
  },
);
export type Note = InferSchemaType<typeof notesSchema>;
export const NoteModel = model<Note>("Note", notesSchema);
