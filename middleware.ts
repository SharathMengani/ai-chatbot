import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Get IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Create response first
  const res = NextResponse.next();

  // Store IP in cookie
  res.cookies.set("ip", ip, {
    httpOnly: false,
    path: "/",
  });

  // Redirect logic
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(token ? "/chats" : "/sign-in", req.url)
    );
  }

  return res;
}