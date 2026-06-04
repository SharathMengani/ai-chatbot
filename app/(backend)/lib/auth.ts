import NextAuth, { getServerSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { generateAccessToken, signRefreshToken } from "./jwt";
import Github from "next-auth/providers/github";

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
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
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

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error("Password not set. Please use Google login or set password.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }
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
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB();

        const existingUser = await User.findOne({
          email: user.email,
        });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
            password: null,
            loginHistory: [
              {
                ip: "unknown",
                userAgent: `${account.provider}-oauth`,
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
                  userAgent: `${account.provider}-oauth`,
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