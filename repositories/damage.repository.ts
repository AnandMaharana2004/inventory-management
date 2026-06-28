import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateDamageInput = Prisma.DamageCreateInput;

export const damageRepository = {
    async create(
        tx: Prisma.TransactionClient,
        data: CreateDamageInput
    ) {
        return tx.damage.create({
            data,
        });
    },

    async getDamageById(id: number) {
        return prisma.damage.findUnique({
            where: {
                id,
            },
            include: {
                item: true,
                createdBy: true,
            },
        });
    },

    async getAllDamages() {
        return prisma.damage.findMany({
            include: {
                item: true,
                createdBy: true,
            },
            orderBy: {
                damageDate: "desc",
            },
        });
    },

    async getDamagesByItem(itemId: number) {
        return prisma.damage.findMany({
            where: {
                itemId,
            },
            include: {
                createdBy: true,
            },
            orderBy: {
                damageDate: "desc",
            },
        });
    },

    async getDamagesByDateRange(
        startDate: Date,
        endDate: Date
    ) {
        return prisma.damage.findMany({
            where: {
                damageDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                item: true,
                createdBy: true,
            },
            orderBy: {
                damageDate: "desc",
            },
        });
    },

    async getDamageForStockRollback(id: number) {
        return prisma.damage.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                damageDate: true,
                itemId: true,
                totalPieces: true,
            },
        });
    },

    async updateDamage(
        id: number,
        data: Prisma.DamageUpdateInput
    ) {
        return prisma.damage.update({
            where: {
                id,
            },
            data,
        });
    },

    async deleteDamage(
        tx: Prisma.TransactionClient,
        id: number
    ) {
        return tx.damage.delete({
            where: {
                id,
            },
        });
    },
};