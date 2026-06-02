import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import path from "path";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { authOptions } from "@/app/(backend)/lib/auth";

export async function DELETE() {
  try {
const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // delete local file if it exists
    if (
      user.image &&
      user.image.startsWith("/uploads/")
    ) {
      try {
        const filepath = path.join(
          process.cwd(),
          "public",
          user.image
        );

        await unlink(filepath);
      } catch (error) {
        console.error("Image file not found", error);
      }
    }

    user.image = "";
    await user.save();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}