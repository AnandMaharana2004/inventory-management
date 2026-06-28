import { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

export const purchaseDetailRepository = {
    async getPurchaseDetailById(id: number) {
        return prisma.poDtl.findUnique({
            where: {
                id,
            },
            include: {
                item: true,
                po: true,
            },
        });
    },

    async getPurchaseDetailsByPurchaseId(poId: number) {
        return prisma.poDtl.findMany({
            where: {
                poId,
            },
            include: {
                item: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    },

    async getPurchaseDetailsByItem(itemId: number) {
        return prisma.poDtl.findMany({
            where: {
                itemId,
            },
            include: {
                po: {
                    include: {
                        vendor: true,
                    },
                },
            },
            orderBy: {
                po: {
                    poDate: "desc",
                },
            },
        });
    },

    async deleteByPurchaseId(
        tx: Prisma.TransactionClient,
        poId: number
    ) {
        return tx.poDtl.deleteMany({
            where: {
                poId,
            },
        });
    }
};