import { Schema, model, InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    catagories: {
      type: [categorySchema],
      default: [
        {
          id: 1,
          name: "Void",
          isDeleted: false,
        },
      ],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // OAuth tokens
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>("User", userSchema);
