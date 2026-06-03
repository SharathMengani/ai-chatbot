import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { NextResponse } from "next/server";

const bcrypt = await import("bcrypt");

export async function POST(req: Request) {
  try {
    await connectDB();

    const { currentPassword, newPassword, userEmail } = await req.json();

    if (!newPassword || !userEmail) {
      return NextResponse.json(
        {
          error: "New password and user email are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email: userEmail,
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hadPassword = !!existingUser.password;

    // User already has a password → validate current password
    if (hadPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;

    // Optional:
    // existingUser.provider = "credentials";

    await existingUser.save();

    return NextResponse.json(
      {
        message: hadPassword
          ? "Password changed successfully"
          : "Password set successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}