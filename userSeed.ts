// lib/seeds/userSeed.ts

import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/enums";
import { hashPassword } from "@/lib/cripto";
import { Env } from "./constants/env";

export async function userSeed() {
    console.log("Seeding users...");

    // Optional: Remove existing users first.
    // Remove this if you don't want to delete existing users.
    await prisma.user.deleteMany();

    const passwordHash = await hashPassword(Env.SEED_USER_PASSWORD);

    const users = [
        {
            name: Env.SEED_USER_NAME,
            passwordHash,
            role: UserRole.ADMIN,
            contactNumber: Env.SEED_USER_CONTACT_NUMBER,
            email: Env.SEED_USER_EMAIL,
        },
        
    ];

    await prisma.user.createMany({
        data: users,
    });

    console.log(`✅ ${users.length} users seeded successfully.`);

    return {
        users: users.length,
    };
}