import { Schema, model, InferSchemaType } from "mongoose";

const sharedNoteSchema = new Schema(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      unique: true,
    },
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    generalAccessLevel: {
      type: String,
      enum: ["readonly", "edit"],
      required: true,
      default: "readonly",
    },
    collaborators: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        accessLevel: {
          type: String,
          enum: ["readonly", "edit"],
          required: true,
          default: "readonly",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export type SharedNote = InferSchemaType<typeof sharedNoteSchema>;
export const SharedNoteModel = model<SharedNote>("SharedNote", sharedNoteSchema);
