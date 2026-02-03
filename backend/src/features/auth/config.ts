import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "./db.js";
import { AppError } from "../../shared/errors/AppError.js";
import logger from "../../shared/utils/logger.js";
import { UserModel } from "../../models/User.js";
import { NoteModel } from "../../models/Notes.js";
import { ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS } from "../../config/timers.config.js";

const myAdapter = MongoDBAdapter(clientPromise);

export const authConfig = {
  adapter: {
    ...myAdapter,
    async createUser(user: any) {
      try {
        // Extract Google ID from the user object
        const googleId = user.id || user.sub;

        // Check if user already exists in your UserModel
        let existingUser = await UserModel.findOne({ googleId });

        if (existingUser) {
          logger.info(`User already exists: ${existingUser.email}`);
          // Update user info if needed
          existingUser.name = user.name || existingUser.name;
          existingUser.email = user.email || existingUser.email;
          await existingUser.save();

          // Return in Auth.js format
          return {
            id: existingUser._id.toString(),
            email: existingUser.email,
            name: existingUser.name,
            emailVerified: user.emailVerified,
          };
        }

        // Extract displayName from email (everything before @)
        const emailUsername = user.email.split("@")[0];

        // Try to split name into first and last name
        const nameParts = (user.name || "").trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Create user in your UserModel with your schema
        const newUser = await UserModel.create({
          googleId,
          email: user.email,
          name: user.name,
          displayName: emailUsername,
          firstName,
          lastName,
          avatar: "default-avatar-1",
          catagories: [], // Initialize with empty categories
          isDeleted: false,
        });

        logger.info(`New user created: ${newUser.email}`);

        // Return in Auth.js format (Auth.js will handle sessions)
        return {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          emailVerified: user.emailVerified,
        };
      } catch (error: any) {
        logger.error(error);
        throw new AppError(error.message, 500);
      }
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        if (account && account.provider === "google") {
          const googleId = profile.sub || user.id;

          // Prepare update fields
          const updateFields: any = {
            accessToken: account.access_token,
            tokenExpiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
          };

          // Only update refresh token if provided (Google only sends it on first consent or forced consent)
          if (account.refresh_token) {
            updateFields.refreshToken = account.refresh_token;
          }

          // Update user with tokens
          const dbUser = await UserModel.findOneAndUpdate(
            { googleId },
            { $set: updateFields },
            { upsert: false, new: true },
          );

          if (dbUser && dbUser.isDeactivated && dbUser.deactivatedAt) {
            const gracePeriodSeconds = ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS;
            const now = Math.floor(Date.now() / 1000);
            const deactivatedAt = dbUser.deactivatedAt as unknown as number;
            const timeSinceDeactivation = now - deactivatedAt;

            if (timeSinceDeactivation > gracePeriodSeconds) {
               // Grace period expired, mark all notes as deleted
               await NoteModel.updateMany({ userId: dbUser._id }, { isDeleted: true });
               logger.info(`Grace period expired for user ${dbUser.email}. Notes marked as deleted.`);
            }
          }

          logger.info(`Tokens stored for user: ${user.email}`);
        }
        return true;
      } catch (error: any) {
        logger.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, user }: any) {
      if (session.user) {
        // Fetch additional user data from your UserModel
        const dbUser = await UserModel.findOne({
          $or: [{ googleId: user.id }, { email: user.email }],
        });

        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.displayName = dbUser.displayName;
          session.user.firstName = dbUser.firstName;
          session.user.lastName = dbUser.lastName;
          session.user.bio = dbUser.bio;
          session.user.avatar = dbUser.avatar;
          session.user.avatarBgColor = dbUser.avatarBgColor;
          session.user.categories = dbUser.catagories;
          session.user.isDeleted = dbUser.isDeleted;
          session.user.isDeactivated = dbUser.isDeactivated;
          session.user.deactivatedAt = dbUser.deactivatedAt;
          session.user.reactivationRequestSubmitted = dbUser.reactivationRequestSubmitted;
          // Don't expose tokens in session for security
        } else {
          session.user.id = user.id;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      const frontendUrl = process.env.FRONTEND_URL;

      if (frontendUrl && url.startsWith(frontendUrl)) {
        return url;
      }

      if (url.startsWith("/")) return new URL(url, baseUrl).toString();

      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },
};
