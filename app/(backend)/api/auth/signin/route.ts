import { User } from "@/app/(backend)/models/User";
import { connectDB } from "@/app/(backend)/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                {
                    message: "Email and password are required",
                },
                {
                    status: 400,
                }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                {
                    message: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    message: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }

        return NextResponse.json(
            {
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Signin Error:", error);

        return NextResponse.json(
            {
                message: "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}