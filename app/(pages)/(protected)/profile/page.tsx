"use client";

import { useProfileStore } from "@/app/store/profileStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CgExternal } from "react-icons/cg";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

interface User {
    name: string;
    email: string;
    image?: string;
    provider?: string;
}

export default function ProfilePage() {
    const [uploading, setUploading] = useState(false);
    const {
        user,
        fetched,
        fetchProfile,
        uploadImage,
        loading, deleteImage
    } = useProfileStore();

    useEffect(() => {
        if (!fetched) {
            fetchProfile();
        }
    }, [fetched]);

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setUploading(true);
        const file = e.target.files?.[0];

        if (!file) return;

        await uploadImage(file);
        setUploading(false);
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
            <div className="mb-1 flex items-center justify-between gap-2">
                <Link
                    href="/chats"
                    className="inline-flex items-center gap-1 transition"
                >
                    <MdOutlineKeyboardArrowLeft className="text-xl" />
                    Back to Chat
                </Link>
            </div>

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
                            <button aria-label="Profile Image Delete"
                                onClick={deleteImage}
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
                    <div className="pt-4 border-t border-black/10 dark:border-white/10">
                        <p className="text-sm text-gray-500 mb-2">
                            Security
                        </p>

                        <Link
                            href="/change-password"
                            className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-black/10
            dark:border-white/10
            px-4
            py-3
            transition
            hover:bg-black/5
            dark:hover:bg-white/5
        "
                        >
                            <span>
                                {user.hasPassword
                                    ? "Change Password"
                                    : "Set Password"}
                            </span>

                            <CgExternal className="text-lg opacity-70" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}