import { ExternalNav } from "@/app/components/ExternalNav";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="min-h-screen">

            <ExternalNav />
            <main>{children}</main>
        </div>
    );
}