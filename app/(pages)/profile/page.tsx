"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

interface User {
    name: string;
    email: string;
    image?: string;
    provider?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [uploading, setUploading] = useState(false);
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

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/profile/upload-image", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.image) {
                setUser((prev) =>
                    prev
                        ? {
                            ...prev,
                            image: data.image,
                        }
                        : prev
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            const res = await fetch(
                "/api/profile/delete-image",
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete image");
            }

            setUser((prev) =>
                prev
                    ? {
                        ...prev,
                        image: "",
                    }
                    : prev
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                Loading profile...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                User not found
            </div>
        );
    }

    const initials = user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="max-w-xl w-full mx-auto px-4 py-24">
            <Link
                href="/chats"
                className="inline-flex items-center gap-1 mb-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
                <MdOutlineKeyboardArrowLeft className="text-xl" />
                Back to Chat
            </Link>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur p-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <label
                            htmlFor="profile-image"
                            className="cursor-pointer block"
                        >
                            <img
                                src={
                                    user.image ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user.name
                                    )}&size=256`
                                }
                                alt={user.name}
                                className="
          w-32
          h-32
          rounded-full
          object-cover
          border-2
          border-black/10
          dark:border-white/10
          transition-all
          group-hover:brightness-75
        "
                            />
                        </label>

                        {user.image && (
                            <button
                                onClick={handleDeleteImage}
                                className="
          absolute
          top-2
          right-2
          w-8
          h-8
          rounded-full
          bg-white
          dark:bg-black
          border
          border-black/10
          dark:border-white/10
          flex
          items-center
          justify-center
          text-red-500
          shadow-md
          opacity-0
          group-hover:opacity-100
          transition-all
          hover:scale-110
        "
                            >
                                <FaRegTrashCan size={14} />
                            </button>
                        )}
                    </div>

                    <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />

                    <label
                        htmlFor="profile-image"
                        className="
      mt-4
      px-4
      py-2
      rounded-xl
      border
      border-black/10
      dark:border-white/10
      cursor-pointer
      hover:bg-black/5
      dark:hover:bg-white/5
      transition
    "
                    >
                        {uploading ? "Uploading..." : "Change Photo"}
                    </label>
                </div>

                {/* Details */}
                <div className="mt-10 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Name
                        </p>

                        <p className="font-medium text-lg">
                            {user.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Email
                        </p>

                        <p className="font-medium text-lg break-all">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Authentication Provider
                        </p>

                        <p className="font-medium text-lg capitalize">
                            {user.provider || "credentials"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}