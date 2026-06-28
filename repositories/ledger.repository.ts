import { Prisma, ReferenceType } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateLedgerEntryInput = Prisma.StockLedgerCreateInput;

export const ledgerRepository = {
    async create(
        tx: Prisma.TransactionClient,
        data: CreateLedgerEntryInput
    ) {
        return tx.stockLedger.create({
            data,
        });
    },

    async createMany(
        tx: Prisma.TransactionClient,
        data: CreateLedgerEntryInput[]
    ) {
        return Promise.all(
            data.map((entry) =>
                tx.stockLedger.create({
                    data: entry,
                })
            )
        );
    },

    async getLedgerById(id: number) {
        return prisma.stockLedger.findUnique({
            where: {
                id,
            },
            include: {
                item: true,
                createdBy: true,
            },
        });
    },

    async getLedgerByItem(itemId: number) {
        return prisma.stockLedger.findMany({
            where: {
                itemId,
            },
            orderBy: {
                txnDate: "desc",
            },
        });
    },

    async getLedgerByReference(
        referenceType: ReferenceType,
        referenceId: number
    ) {
        return prisma.stockLedger.findMany({
            where: {
                referenceType,
                referenceId,
            },
            include: {
                item: true,
            },
        });
    },

    async getLedgerByDateRange(
        startDate: Date,
        endDate: Date
    ) {
        return prisma.stockLedger.findMany({
            where: {
                txnDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                item: true,
                createdBy: true,
            },
            orderBy: {
                txnDate: "desc",
            },
        });
    },

    async getItemLastLedger(itemId: number) {
        return prisma.stockLedger.findFirst({
            where: {
                itemId,
            },
            orderBy: {
                txnDate: "desc",
                id: "desc",
            },
        });
    },

    async deleteByReference(
        tx: Prisma.TransactionClient,
        referenceType: ReferenceType,
        referenceId: number
    ) {
        return tx.stockLedger.deleteMany({
            where: {
                referenceType,
                referenceId,
            },
        });
    },
};