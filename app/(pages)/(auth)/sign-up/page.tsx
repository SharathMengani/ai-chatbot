"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormData, signUpSchema } from "../../../schema/signUpSchema";
import { toast } from "sonner";
import { useUserColor } from "@/app/context/UserColorContext";
import { getColor } from "@/app/utils";


export default function SignUpPage() {
    const { userColor } = useUserColor()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange", // realtime validation
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error("Failed to create user:", { description: result.message });
            }

        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    return (
        <div className="py-24 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border dark:border-white/10 border-black/10 bg-black/10 dark:bg-white/10 p-8 backdrop-blur">
                <h1 className="text-3xl font-bold mb-2">
                    Create Account
                </h1>

                <p className="text-gray-400 mb-8">
                    Sign up to get started
                </p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div>
                        <input
                            {...register("name")}
                            placeholder="Full Name"
                            className="w-full rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 px-4 py-3 outline-none"
                        />

                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="Email Address"
                            className="w-full rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 px-4 py-3 outline-none"
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="Password"
                            className="w-full rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 px-4 py-3 outline-none"
                        />

                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 px-4 py-3 outline-none"
                        />

                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full rounded-xl ${userColor} py-3 font-medium  disabled:opacity-50`}
                    >
                        {isSubmitting ? "Creating..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="hover:underline"
                        style={{ color: getColor(userColor) }}
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}