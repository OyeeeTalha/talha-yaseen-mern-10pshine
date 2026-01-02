import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db.js"; 
import { AppError } from "../../shared/errors/AppError.js";
import logger from "../../shared/utils/logger.js";

const myAdapter = MongoDBAdapter(clientPromise);

export const authConfig = {
  adapter: {
    ...myAdapter,
    async createUser(user: any) {
      try {
        const customUser = {
          ...user,
          isDeleted: false,        
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (!myAdapter.createUser) {
          throw new AppError("createUser method not available in adapter", 500);
        }
        return await myAdapter.createUser(customUser);
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
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id; 
        session.user.role = user.role; 
      }
      return session;
    },
  },
};