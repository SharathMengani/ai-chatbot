import { writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";
import { authOptions } from "@/app/(backend)/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const formData = await req.formData();

    const file = formData.get("image") as File;

    if (!file) {
        return NextResponse.json(
            { message: "No file uploaded" },
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;

    const filepath = path.join(
        process.cwd(),
        "public/uploads",
        filename
    );

    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    await connectDB();

    await User.findOneAndUpdate(
        { email: session.user.email },
        {
            image: imageUrl,
        }
    );

    return NextResponse.json({
        image: imageUrl,
    });
}