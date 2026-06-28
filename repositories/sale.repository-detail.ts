import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

export const saleDetailRepository = {
    async getSaleDetailById(id: number) {
        return prisma.billDtl.findUnique({
            where: {
                id,
            },
            include: {
                item: true,
                bill: true,
            },
        });
    },

    async getSaleDetailsByBillId(billId: number) {
        return prisma.billDtl.findMany({
            where: {
                billId,
            },
            include: {
                item: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    },

    async getSaleDetailsByItem(itemId: number) {
        return prisma.billDtl.findMany({
            where: {
                itemId,
            },
            include: {
                bill: {
                    include: {
                        customer: true,
                    },
                },
            },
            orderBy: {
                bill: {
                    billDate: "desc",
                },
            },
        });
    },

    async deleteByBillId(
        tx: Prisma.TransactionClient,
        billId: number
    ) {
        return tx.billDtl.deleteMany({
            where: {
                billId,
            },
        });
    },
};