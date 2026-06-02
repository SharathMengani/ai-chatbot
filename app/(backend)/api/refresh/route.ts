import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
        return Response.json({ message: "No token" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET!
        ) as any;

        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_SECRET!,
            { expiresIn: "15m" }
        );

        return Response.json({ accessToken: newAccessToken });
    } catch {
        return Response.json({ message: "Invalid token" }, { status: 403 });
    }
}