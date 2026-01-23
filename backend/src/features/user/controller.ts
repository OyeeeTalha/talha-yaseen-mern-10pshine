import { Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { AppError } from "../../shared/errors/AppError.js";
import { catchAsync } from "../../shared/utils/catchAsync.js";
import { updateProfileSchema } from "./schema.js";
import logger from "../../shared/utils/logger.js";

// Get current user profile
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const user = await UserModel.findById(userId).select(
    "-accessToken -refreshToken -tokenExpiresAt -googleId",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        avatarBgColor: user.avatarBgColor,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

// Update user profile
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  // Validate input
  const validatedData = updateProfileSchema.parse(req.body);

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: validatedData },
    { new: true, runValidators: true },
  ).select("-accessToken -refreshToken -tokenExpiresAt -googleId");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  logger.info(`User profile updated: ${user.email}`);

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        avatarBgColor: user.avatarBgColor,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

// Deactivate user account
export const deactivateAccount = catchAsync(
  async (req: Request, res: Response) => {
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    logger.info(`User account deactivated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  },
);
