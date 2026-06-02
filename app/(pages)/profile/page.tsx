"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

interface User {
    name: string;
    email: string;
    image?: string;
    provider?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const res = await fetch("/api/profile");

                if (!res.ok) {
                    throw new Error("Failed to load profile");
                }

                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                User not found
            </div>
        );
    }

    return (
        <div className="mx-auto px-4  max-w-2xl py-24">
            <Link href={'/chats'} className="flex items-center text-lg gap-1 mb-1 text-gray-500 hover:text-gray-700 transition">
                <MdOutlineKeyboardArrowLeft /> Back to chat
            </Link>
            <div className="w-full max-w-md  rounded-2xl border dark:border-white/10 border-black/10 bg-black/10 dark:bg-white/10 p-8 backdrop-blur">

                <div className="flex flex-col items-center">
                    <img
                        src={
                            user.image ||
                            "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(user.name)
                        }
                        alt={user.name}
                        className="w-24 h-24 rounded-full border object-cover"
                    />

                    <h1 className="text-2xl font-bold mt-4">
                        {user.name}
                    </h1>

                    <p className="text-gray-500">
                        {user.email}
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">
                            Name
                        </p>
                        <p className="font-medium">
                            {user.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Email
                        </p>
                        <p className="font-medium">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Provider
                        </p>
                        <p className="font-medium capitalize">
                            {user.provider || "credentials"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}