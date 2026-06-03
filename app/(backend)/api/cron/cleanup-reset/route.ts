import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/mongodb";
import { cleanupResetTokens } from "@/app/(backend)/lib/cron/cleanupResetTokens";

export async function GET() {
    try {
        await connectDB();

        const result = await cleanupResetTokens();

        return NextResponse.json({
            message: "Cleanup executed successfully",
            removed: result.modifiedCount,
        });
    } catch (error) {
        console.error("Cleanup API error:", error);

        return NextResponse.json(
            { error: "Cleanup failed" },
            { status: 500 }
        );
    }
}