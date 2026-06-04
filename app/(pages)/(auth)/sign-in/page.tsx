"use client";

import { useUserColor } from "@/app/context/UserColorContext";
import { SignInFormData, signInSchema } from "@/app/schema/signInSchema";
import { useProfileStore } from "@/app/store/profileStore";
import { getColor } from "@/app/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

export default function SignInPage() {
    const { userColor } = useUserColor();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        mode: "onChange", // realtime validation
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Login failed:", { description: result.error });
                return;
            }
            await useProfileStore.getState().fetchProfile();
            router.push("/chats");

        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="py-42 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border dark:border-white/10 border-black/10 bg-black/10 dark:bg-white/10 p-8 backdrop-blur">
                <h1 className="text-3xl font-bold  mb-2">
                    Welcome Back
                </h1>

                <p className="text-gray-400 mb-8">
                    Sign in to your account
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <Link href={'/forgot-password'} className="flex justify-end text-sm mt-1" >Forgot Password</Link>
                    </div>


                    <button
                        type="submit"
                        className={`w-full rounded-xl ${userColor} py-3 font-medium  disabled:opacity-50`}
                    >
                        {isSubmitting ? 'Signing In...' : ' Sign In'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                    <span className="text-sm text-gray-400">Or</span>
                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() =>
                            signIn("google", {
                                callbackUrl: "/chats",
                            })
                        }
                        className="w-full rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                        <FcGoogle className="text-xl" /> Google
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            signIn("github", {
                                callbackUrl: "/chats",
                            })
                        }
                        className="w-full rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                        <BsGithub className="text-xl" /> Github
                    </button>
                </div>


                <p className="mt-6 text-center text-gray-400">
                    Don't have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="hover:underline"
                        style={{ color: getColor(userColor) }}
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}