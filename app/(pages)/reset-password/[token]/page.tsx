"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema } from "@/app/schema/ChangePasswordSchema";
import { useUserColor } from "@/app/context/UserColorContext";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

type PasswordForm = {
    newPassword: string;
    confirmPassword: string;
};
export default function ResetPasswordPage() {
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const { userColor } = useUserColor();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordForm>({
        resolver: zodResolver(ResetPasswordSchema),
        mode: "onBlur",
    });

    const onSubmit = async (data: PasswordForm) => {
        try {
            setLoading(true);
            const payload = {
                newPassword: data.newPassword,
                token: params.token
            };
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result?.error || "Something went wrong");
            }
            toast.success(result.message || "Password updated successfully");
            reset();
            router.push("/sign-in");

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="py-42 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border dark:border-white/10 border-black/10 bg-black/10 dark:bg-white/10 p-8 backdrop-blur">
                <h1 className="text-3xl font-bold mb-2">
                    Reset Password
                </h1>

                <p className="text-gray-400 mb-8">
                    Enter your new password below.
                </p>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >


                    {/* New Password */}
                    <div>
                        <input
                            type="text"
                            placeholder="New Password"
                            {...register("newPassword")}
                            className="w-full rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 px-4 py-3 outline-none"
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <input
                            type="text"
                            placeholder="Confirm Password"
                            {...register("confirmPassword")}
                            className="w-full rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 px-4 py-3 outline-none"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full rounded-xl ${userColor} py-3 font-medium  disabled:opacity-50`}
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}