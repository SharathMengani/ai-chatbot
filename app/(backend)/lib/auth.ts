import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { generateAccessToken, signRefreshToken } from "./jwt";
import { NextResponse } from "next/server";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (
          !user ||
          user.provider === "google" ||
          !user.password ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          throw new Error("Invalid email or password");
        }
        console.log('req?.headers', req?.headers)
        const forwarded = req?.headers?.["x-forwarded-for"];
        const ip =
          (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ||
          "unknown";

        const userAgent = req?.headers?.["user-agent"] || "unknown";

        // ✅ Save login history
        await User.updateOne(
          { _id: user._id },
          {
            $push: {
              loginHistory: {
                ip,
                userAgent,
                loggedInAt: new Date(),
              },
            },
          }
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      }
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ user, account }: { user: any, account: any }) {
      if (account?.provider === "google") {
        await connectDB();

        const existingUser = await User.findOne({
          email: user.email,
        });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            password: null,
            loginHistory: [
              {
                ip: "unknown",
                userAgent: "google-oauth",
                loggedInAt: new Date(),
              },
            ],
          });
        } else {
          // ✅ ALSO LOG LOGIN FOR EXISTING GOOGLE USERS
          await User.updateOne(
            { _id: existingUser._id },
            {
              $push: {
                loginHistory: {
                  ip: "unknown",
                  userAgent: "google-oauth",
                  loggedInAt: new Date(),
                },
              },
            }
          );
        }
      }

      return true;
    },
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };