import { Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { AppError } from "../../shared/errors/AppError.js";
import { catchAsync } from "../../shared/utils/catchAsync.js";
import { updateProfileSchema } from "./schema.js";
import logger from "../../shared/utils/logger.js";
import {
  ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS,
  REACTIVATION_REQUEST_COOLDOWN_SECONDS
} from "../../config/timers.config.js";
import nodemailer from "nodemailer";

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

// Deactivate user account (Start 30-day grace period)
export const deactivateAccount = catchAsync(
  async (req: Request, res: Response) => {
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const deactivatedAt = Math.floor(Date.now() / 1000); // Current time in Unix seconds
    const deactivationExpireAt = new Date(Date.now() + ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS * 1000);

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          isDeactivated: true,
          deactivatedAt: deactivatedAt,
          deactivationExpireAt: deactivationExpireAt,
          isDeleted: false, // Ensure not deleted yet
        },
      },
      { new: true }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    logger.info(`User account deactivated (grace period started): ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Account deactivated. You have 30 days to recover your account.",
    });
  },
);

// Cancel deactivation (Recover account)
export const cancelDeactivation = catchAsync(
  async (req: Request, res: Response) => {
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isDeactivated) {
      throw new AppError("Account is not deactivated", 400);
    }

    const gracePeriodSeconds = ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS;
    const now = Math.floor(Date.now() / 1000);
    const deactivatedAt = user.deactivatedAt as unknown as number; // Unix timestamp
    const timeSinceDeactivation = now - deactivatedAt;

    if (timeSinceDeactivation > gracePeriodSeconds) {
      throw new AppError("Grace period expired. Please submit a reactivation request.", 400);
    }

    user.isDeactivated = false;
    user.deactivatedAt = null;

    await UserModel.findByIdAndUpdate(userId, {
      $set: { isDeactivated: false },
      $unset: { deactivatedAt: 1, deactivationExpireAt: 1 }
    });

    logger.info(`User account reactivated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Account reactivated successfully",
    });
  },
);

// Submit reactivation request (After 30 days)
export const submitReactivationRequest = catchAsync(
  async (req: Request, res: Response) => {
    const userId = res.locals.session?.user?.id;
    const { subject, message } = req.body;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.reactivationRequestSubmitted && user.reactivationRequestSubmittedAt) {
      const now = Math.floor(Date.now() / 1000);
      const lastRequestTime = user.reactivationRequestSubmittedAt as unknown as number;
      const timeSince = now - lastRequestTime;

      if (timeSince < REACTIVATION_REQUEST_COOLDOWN_SECONDS) {
        throw new AppError("Your previous request is pending. You can send another request after 2 days.", 400);
      }
    }

    // Logic to send email via Gmail App Password (Nodemailer)
    try {
      // Use configured Service Email credentials to send the notification
      const serviceEmail = process.env.SERVICE_EMAIL;
      const servicePassword = process.env.SERVICE_EMAIL_PASSWORD; // App Password

      if (serviceEmail && servicePassword) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: serviceEmail,
            pass: servicePassword,
          },
        });

        const adminEmail = process.env.ADMIN_EMAIL || "talhayaseen.dev@gmail.com";

        await transporter.sendMail({
          from: `"Notes App Support" <${serviceEmail}>`,
          to: adminEmail,
          replyTo: user.email,
          subject: `[Reactivation Request] ${subject}`,
          html: `<p><strong>Request From:</strong> ${user.name} (${user.email})</p><p><strong>ID:</strong> ${user._id}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p>`,
          text: `Request From: ${user.name} (${user.email})\nID: ${user._id}\nSubject: ${subject}\nMessage:\n${message}`,
        });

        logger.info(`Reactivation notification sent to admin via ${serviceEmail}`);
      } else {
        logger.warn(`Missing SERVICE_EMAIL or SERVICE_EMAIL_PASSWORD env vars. Cannot send email via Nodemailer.`);
      }
    } catch (error) {
      logger.error(`Failed to send reactivation email: ${error}`);
      // Don't block the UI flow, just log the error
    }

    logger.info(`Reactivation request from ${user.email}: ${subject} - ${message}`);

    // Mark as submitted
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        reactivationRequestSubmitted: true,
        reactivationRequestSubmittedAt: Math.floor(Date.now() / 1000)
      }
    });

    res.status(200).json({
      success: true,
      message: "Request submitted successfully",
    });
  },
);
