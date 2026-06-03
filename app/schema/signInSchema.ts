import { z } from "zod";

export const signInSchema = z
    .object({
        email: z
            .string()
            .email("Enter a valid email address"),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[0-9]/, "Must contain a number"),
    })
 

export type SignInFormData = z.infer<typeof signInSchema>;


export const forgotPasswordSchema = z
    .object({
        email: z
            .string()
            .email("Enter a valid email address"),
    })
 

export type ForgotFormData = z.infer<typeof forgotPasswordSchema>;