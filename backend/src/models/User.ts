import { Schema, model, InferSchemaType, Types } from "mongoose";

const categorySchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
      required: true,
      index: false, // Explicitly disable index to prevent global unique constraint
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: false, // Explicitly disable index to prevent global unique constraint
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
    displayName: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: "default-avatar-1",
    },
    avatarBgColor: {
      type: String,
      default: "#60a5fa",
    },
    catagories: {
      type: [categorySchema],
      default: function () {
        return [
          {
            id: new Types.ObjectId(),
            name: "Void",
          },
        ];
      },
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
    // Account Deactivation
    isDeactivated: {
      type: Boolean,
      default: false,
    },
    deactivatedAt: {
      type: Number, // Unix timestamp in seconds
      default: null,
    },
    deactivationExpireAt: {
      type: Date,
      default: null,
    },
    reactivationRequestSubmitted: {
      type: Boolean,
      default: false,
    },
    reactivationRequestSubmittedAt: {
      type: Number, // Unix timestamp in seconds
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>("User", userSchema);
