import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { generateAccessToken, signRefreshToken } from "./jwt";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
   
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        const accessToken = generateAccessToken(user);
        const refreshToken = signRefreshToken(user);
        token.accessToken = accessToken;
        token.refreshToken = refreshToken;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
});

// ✅ IMPORTANT: export handler correctly
export { handler as GET, handler as POST };