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

    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    // 1. GET FILE INFO (to get SHA)
    const fileRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!fileRes.ok) {
      const err = await fileRes.json();
      return NextResponse.json({ error: err }, { status: 404 });
    }

    const fileData = await fileRes.json();

    // 2. DELETE FILE
    const deleteRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: "delete profile image",
          sha: fileData.sha, // ✅ REQUIRED
          branch: "main",
        }),
      }
    );

    const data = await deleteRes.json();

    if (!deleteRes.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // 3. UPDATE DB
    await User.findOneAndUpdate(
      { email },
      { image: null, imagePath: null }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}