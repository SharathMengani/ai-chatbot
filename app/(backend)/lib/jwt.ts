import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
// Generate Access Token
export function generateAccessToken(user: any) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        JWT_SECRET,
        {
            expiresIn: "15m", // short-lived (recommended)
        }
    );
};

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

export function signRefreshToken(user: any) {
    return jwt.sign(
        { userId: user.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    )
};