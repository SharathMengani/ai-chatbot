import { NextResponse } from "next/server";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";

const bcrypt = await import("bcrypt");

export async function POST(req: Request) {
    try {
        await connectDB();

        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                {
                    error: "Token and new password are required",
                },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: "Invalid or expired reset link",
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        // Clear reset token after successful password reset
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return NextResponse.json(
            {
                message: "Password reset successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}