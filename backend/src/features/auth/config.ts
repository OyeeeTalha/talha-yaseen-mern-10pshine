import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db.js"; 

const myAdapter = MongoDBAdapter(clientPromise);

export const authConfig = {

  adapter: {
    ...myAdapter,
    async createUser(user: any) {
      const customUser = {
        ...user,
        isDeleted: false,        
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 4. Call the original adapter to actually save it to DB
      return myAdapter.createUser(customUser);
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
        // You can now access your custom fields here too!
        session.user.role = user.role; 
      }
      return session;
    },
  },
};