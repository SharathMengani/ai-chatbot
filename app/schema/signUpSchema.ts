import { z } from "zod";

export const signUpSchema = z
    .object({
        name: z
            .string()
            .min(3, "Name must be at least 3 characters"),

        email: z
            .string()
            .email("Enter a valid email address"),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[0-9]/, "Must contain a number"),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export type SignUpFormData = z.infer<typeof signUpSchema>;