import { z } from "zod";
import { UserRole } from "@/lib/generated/prisma/enums";

export const createUserSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    // Only MANAGER and SALESMAN can be created via this route — ADMIN excluded
    role: z.enum([UserRole.MANAGER, UserRole.SALESMAN] as const, {
        message: "Role must be MANAGER or SALESMAN.",
    }),
    contactNumber: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Admin updating another user's profile — same role restriction as create, no password field
// (password changes go through the dedicated self-service endpoint, never this one)
export const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Invalid email address.").optional(),
    role: z.enum([UserRole.MANAGER, UserRole.SALESMAN] as const, {
        message: "Role must be MANAGER or SALESMAN.",
    }).optional(),
    contactNumber: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Self-service password change — requires proving you know the current password
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required."),
        newPassword: z.string().min(6, "New password must be at least 6 characters."),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password.",
        path: ["newPassword"],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;