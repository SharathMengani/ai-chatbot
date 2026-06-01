
import { User } from "@/app/(backend)/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/(backend)/lib/mongodb";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    message: "All fields are required",
                },
                {
                    status: 400,
                }
            );
        }

        const existingUser = await User.findOne({
            email,
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    message: "User already exists",
                },
                {
                    status: 409,
                }
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return NextResponse.json(
            {
                message: "User created successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(error);

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