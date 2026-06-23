import {
    Prisma,
    PrismaClient,
} from "@/lib/generated/prisma/client";

import prisma from "@/lib/prisma";

type CreatePurchaseInput = Prisma.PoHdrCreateInput;


export const purchaseRepository = {
    async create(
        tx: Prisma.TransactionClient,
        data: CreatePurchaseInput
    ) {
        return tx.poHdr.create({
            data,
            include: {
                details: true,
            },
        });
    },

    async getPurchaseById(id: number) {
        return prisma.poHdr.findUnique({
            where: {
                id,
            },
            include: {
                vendor: true,
                createdBy: true,
                details: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    },

    async getAllPurchases() {
        return prisma.poHdr.findMany({
            include: {
                vendor: true,
            },
            orderBy: {
                poDate: "desc",
            },
        });
    },

    async getPurchasesByVendor(vendorId: number) {
        return prisma.poHdr.findMany({
            where: {
                vendorId,
            },
            include: {
                vendor: true,
            },
            orderBy: {
                poDate: "desc",
            },
        });
    },

    async getPurchasesByDateRange(
        startDate: Date,
        endDate: Date
    ) {
        return prisma.poHdr.findMany({
            where: {
                poDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                vendor: true,
            },
        });
    },

    async deletePurchase(
        tx: Prisma.TransactionClient,
        id: number
    ) {
        return tx.poHdr.delete({
            where: {
                id,
            },
        });
    },
};