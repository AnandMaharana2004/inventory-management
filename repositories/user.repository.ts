import { Prisma } from "@/lib/generated/prisma/client";
import { UserRole } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

type CreateUserInput = {
    name: string;
    passwordHash: string;
    role: UserRole;
    contactNumber?: string;
    email?: string;
};

export const userRepository = {
    async create(data: CreateUserInput) {
        return prisma.user.create({
            data,
        });
    },

    async getUsersByName(name: string) {
        return prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    mode: "insensitive",
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    },

    async getUserById(id: number) {
        return prisma.user.findUnique({
            where: {
                id,
            },
        });
    },

    async getUserByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email,
            },
        });
    },

    async getAllUsers() {
        return prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async updateUser(
        id: number,
        data: Prisma.UserUpdateInput
    ) {
        return prisma.user.update({
            where: {
                id,
            },
            data,
        });
    },

    async deactivateUser(id: number) {
        return prisma.user.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });
    },

    async activateUser(id: number) {
        return prisma.user.update({
            where: {
                id,
            },
            data: {
                isActive: true,
            },
        });
    },

    async deleteUser(id: number) {
        return prisma.user.delete({
            where: {
                id,
            },
        });
    },
};