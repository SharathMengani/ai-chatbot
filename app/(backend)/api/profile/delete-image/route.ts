// app/api/profile/delete-image/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";

function extractGitHubPath(imageUrl: string) {
  // Convert raw URL → repo path
  if (imageUrl.startsWith("http")) {
    const url = new URL(imageUrl);

    // /owner/repo/branch/path/to/file
    const parts = url.pathname.split("/");

    // remove: ["", owner, repo, "main"]
    return parts.slice(4).join("/");
  }

  // already a path
  return imageUrl.replace(/^\/+/, "");
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, imageUrl } = await req.json();
    if (!email || !imageUrl) {
      return NextResponse.json(
        { error: "Missing email or imageUrl" },
        { status: 400 }
      );
    }

    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    // ✅ Convert URL → repo path
    const filePath = extractGitHubPath(imageUrl);

    // 1. Get file SHA
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
      const errText = await fileRes.text();
      return NextResponse.json(
        { step: "GET_FAILED", error: errText, filePath },
        { status: 404 }
      );
    }

    const fileData = await fileRes.json();

    // 2. Delete file
    const deleteRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "delete profile image",
          sha: fileData.sha,
          branch: "main",
        }),
      }
    );

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      return NextResponse.json(
        { step: "DELETE_FAILED", error: errText },
        { status: 500 }
      );
    }

    // 3. Update DB
    await User.findOneAndUpdate(
      { email },
      { image: null }
    );

    return NextResponse.json({ success: true, deletedPath: filePath });
  } catch (err) {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}