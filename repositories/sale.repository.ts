import { Prisma } from "@/lib/generated/prisma/client";
import { PaymentStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

type CreateSaleInput = Prisma.BillHdrCreateInput;

export const saleRepository = {
    async create(
        tx: Prisma.TransactionClient,
        data: CreateSaleInput
    ) {
        return tx.billHdr.create({
            data,
            include: {
                details: true,
            },
        });
    },

    async getSaleById(id: number) {
        return prisma.billHdr.findUnique({
            where: {
                id,
            },
            include: {
                customer: true,
                createdBy: true,
                details: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    },

    async getAllSales() {
        return prisma.billHdr.findMany({
            include: {
                customer: true,
            },
            orderBy: {
                billDate: "desc",
            },
        });
    },

    async getSalesByCustomer(customerId: number) {
        return prisma.billHdr.findMany({
            where: {
                customerId,
            },
            include: {
                customer: true,
            },
            orderBy: {
                billDate: "desc",
            },
        });
    },

    async getSalesByPaymentStatus(
        paymentStatus: PaymentStatus
    ) {
        return prisma.billHdr.findMany({
            where: {
                paymentStatus,
            },
            include: {
                customer: true,
            },
            orderBy: {
                billDate: "desc",
            },
        });
    },

    async getSalesByDateRange(
        startDate: Date,
        endDate: Date
    ) {
        return prisma.billHdr.findMany({
            where: {
                billDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                customer: true,
            },
        });
    },

    async updatePaymentStatus(
        id: number,
        paymentStatus: PaymentStatus
    ) {
        return prisma.billHdr.update({
            where: {
                id,
            },
            data: {
                paymentStatus,
            },
        });
    },

    async getSaleForStockRollback(id: number) {
        return prisma.billHdr.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                billDate: true,

                details: {
                    select: {
                        itemId: true,
                        totalPieces: true,
                    },
                },
            },
        });
    },

    async deleteSale(
        tx: Prisma.TransactionClient,
        id: number
    ) {
        return tx.billHdr.delete({
            where: {
                id,
            },
        });
    },

    async getSaleWithDetails(id: number) {
        return prisma.billHdr.findUnique({
            where: {
                id,
            },
            include: {
                customer: true,
                createdBy: true,
                details: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }
};