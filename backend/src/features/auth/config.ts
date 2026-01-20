import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "./db.js";
import { AppError } from "../../shared/errors/AppError.js";
import logger from "../../shared/utils/logger.js";
import { UserModel } from "../../models/User.js";

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

        // Create user in your UserModel with your schema
        const newUser = await UserModel.create({
          googleId,
          email: user.email,
          name: user.name,
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

          // Update user with tokens
          await UserModel.findOneAndUpdate(
            { googleId },
            {
              $set: {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                tokenExpiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null,
              },
            },
            { upsert: false }
          );

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
          session.user.categories = dbUser.catagories;
          session.user.isDeleted = dbUser.isDeleted;
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
