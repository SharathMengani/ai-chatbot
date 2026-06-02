// app/api/profile/upload-image/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const fileName = `profile-images/${Date.now()}-${file.name}`;

    // 1. Upload to GitHub
    const githubRes = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${fileName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: "upload profile image",
          content: base64,
        }),
      }
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      return NextResponse.json(
        { error: githubData },
        { status: 500 }
      );
    }

    // 2. Create public URL
    const imageUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_REPO}/main/${fileName}`;

    // 3. UPDATE DATABASE (THIS WAS MISSING ❌)
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { image: imageUrl },
      { new: true }
    );

    return NextResponse.json({
      image: imageUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}