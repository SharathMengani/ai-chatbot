"use client";

import { useUserColor } from "@/app/context/UserColorContext";
import { ForgotFormData, forgotPasswordSchema, SignInFormData, signInSchema } from "@/app/schema/signInSchema";
import { useProfileStore } from "@/app/store/profileStore";
import { getColor } from "@/app/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

export default function forgotPasswordPage() {
  const { userColor } = useUserColor();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange", // realtime validation
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Something went wrong");
      }

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


          <button
            type="submit"
            className={`w-full rounded-xl ${userColor} py-3 font-medium  disabled:opacity-50`}
          >
            {isSubmitting ? 'Signing In...' : ' Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}