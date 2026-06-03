// app/(protected)/layout.tsx

import AuthGuard from "@/app/components/AuthGuard";
import Navbar from "@/app/components/Navbar";
import Providers from "@/app/providers";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Providers>
                <AuthGuard >
                    <Navbar />
                    {children}
                </AuthGuard>
            </Providers>
        </>
    );
}