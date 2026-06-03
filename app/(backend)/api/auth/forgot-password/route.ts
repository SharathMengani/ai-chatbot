import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });

        // Prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message:
                    "If an account exists with that email, a reset link has been sent.",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(
            Date.now() + 1000 * 60 * 30 // 30 minutes
        );

        await user.save();

        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/reset-password/${token}`;

        const htmlContent = `

<!DOCTYPE html>

<html>
<head>
<meta charset="UTF-8" />
<title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:40px 20px;">
    <tr>
      <td align="center">
            < table
        width = "600"
        cellpadding = "0"
        cellspacing = "0"
        style = "
        background: #ffffff;
        border - radius: 16px;
        overflow: hidden;
        box - shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        "
            >

            <!--Header -->
                <tr>
                <td
          align="center"
        style = "
        background:#111827;
        padding: 40px 20px;
        "
            >

            <img
            src="https://ai-chatbot-iota-gilt.vercel.app/logo.png"
        alt = "Logo"
        width = "60"
        height = "60"
        style = "display:block;margin-bottom:12px;"
            />

            <h1
            style="
        margin: 0;
        color: #ffffff;
        font - size: 24px;
        font - weight: 700;
        "
            >
            Your App Name
                </h1>

                </td>
                </tr>

                < !--Content -->
                    <tr>
                    <td style="padding:40px;" >

                        <h2
            style="
        margin: 0 0 16px;
        color:#111827;
        "
            >
            Reset your password
                </h2>

                < p
        style = "
        color:#4b5563;
        line - height: 1.7;
        margin: 0 0 16px;
        "
            >
            We received a request to reset the password associated with your account.
          </p>

                < p
        style = "
        color:#4b5563;
        line - height: 1.7;
        margin: 0 0 32px;
        "
            >
            Click the button below to create a new password.This link will expire in 30 minutes.
          </p>

                < div style = "text-align:center;margin:32px 0;" >
                    <a
              href="${resetUrl}"
        style = "
        background:#111827;
        color: #ffffff;
        text - decoration: none;
        padding: 14px 28px;
        border - radius: 10px;
        display: inline - block;
        font - weight: 600;
        "
            >
            Reset Password
                </a>
                </div>

                < hr
        style = "
        border: none;
        border - top: 1px solid #e5e7eb;
        margin: 32px 0;
        "
            />

            <p
            style="
        color:#6b7280;
        font - size: 14px;
        line - height: 1.7;
        "
            >
            If the button doesn't work, copy and paste the following URL into your browser:
                </p>

                < p
        style = "
        word -break: break-all;
        font - size: 14px;
        "
            >
            <a
              href="${resetUrl}"
        style = "color:#2563eb;"
            >
            ${resetUrl}
        </a>
            </p>

            < p
        style = "
        color:#6b7280;
        font - size: 14px;
        margin - top: 24px;
        "
            >
            If you didn't request a password reset, you can safely ignore this email.
                </p>

                </td>
                </tr>

                < !--Footer -->
                    <tr>
                    <td
          align="center"
        style = "
        background: #f9fafb;
        padding: 24px;
        color:#6b7280;
        font - size: 12px;
        "
            >
          © ${new Date().getFullYear()} Your App Name.All rights reserved.
        </td>
            </tr>

            </table>

            </td>
            </tr>
                

  </table>

</body>
</html>
`;


        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.verify();

        await transporter.sendMail({
            from: `"Support" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Reset Your Password",
            html: htmlContent,
        });

        return NextResponse.json({
            message:
                "If an account exists with that email, a reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        return NextResponse.json(
            { error: "Failed to send reset email" },
            { status: 500 }
        );
    }
}