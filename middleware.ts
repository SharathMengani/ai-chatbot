import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get auth token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Get IP safely
  const forwarded = req.headers.get("x-forwarded-for");

  const ip =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Create response
  const res = NextResponse.next();

  // Store IP in cookie (used later in NextAuth callbacks)
  res.cookies.set("login-ip", ip, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  // Redirect root route
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(token ? "/chats" : "/sign-in", req.url)
    );
  }

  return res;
}