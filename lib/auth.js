import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db";
import authConfig from "../auth.config";
import { connectMongoose } from "./mongoose";
import User from "../models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, credentials, account }) {
      await connectMongoose();

      if (account?.provider !== "credentials") {
        // OAuth: ensure the user has a username
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser && !dbUser.username) {
          const base = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
          let username = base;
          let i = 1;
          while (await User.exists({ username })) username = `${base}${i++}`;
          await User.findByIdAndUpdate(dbUser._id, { username });
          user.username = username;
        } else if (dbUser) {
          user.username = dbUser.username;
        }
        return true;
      }

      // Credentials
      const dbUser = await User.findOne({ email: credentials.email });
      if (!dbUser || !dbUser.password) return false;
      const valid = await bcrypt.compare(String(credentials.password), dbUser.password);
      if (valid) user.username = dbUser.username;
      return valid;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.username) session.user.username = token.username;
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.username) token.username = user.username;
      if (trigger === "update" && session?.username) token.username = session.username;
      return token;
    },
  },
});
