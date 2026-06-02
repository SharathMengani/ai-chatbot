// app/api/profile/delete-image/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "Missing filePath" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: "delete profile image",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // remove from DB
    await User.findOneAndUpdate(
      { email },
      { image: null }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}