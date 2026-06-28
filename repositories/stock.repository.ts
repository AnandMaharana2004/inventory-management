import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateStockInput = Prisma.ItemStockCreateInput;

export const stockRepository = {
    async create(
        tx: Prisma.TransactionClient,
        data: CreateStockInput
    ) {
        return tx.itemStock.create({
            data,
        });
    },

    async getStockByItemId(itemId: number) {
        return prisma.itemStock.findUnique({
            where: {
                itemId,
            },
            include: {
                item: true,
            },
        });
    },

    async getAllStocks() {
        return prisma.itemStock.findMany({
            include: {
                item: true,
            },
            orderBy: {
                item: {
                    itemDesc: "asc",
                },
            },
        });
    },

    async increaseStock(
        tx: Prisma.TransactionClient,
        itemId: number,
        quantity: number
    ) {
        return tx.itemStock.update({
            where: {
                itemId,
            },
            data: {
                currentStockPieces: {
                    increment: quantity,
                },
            },
        });
    },

    async decreaseStock(
        tx: Prisma.TransactionClient,
        itemId: number,
        quantity: number
    ) {
        return tx.itemStock.update({
            where: {
                itemId,
            },
            data: {
                currentStockPieces: {
                    decrement: quantity,
                },
            },
        });
    },

    async setStock(
        tx: Prisma.TransactionClient,
        itemId: number,
        quantity: number
    ) {
        return tx.itemStock.update({
            where: {
                itemId,
            },
            data: {
                currentStockPieces: quantity,
            },
        });
    },

    async getLowStockItems() {
        const stocks = await prisma.itemStock.findMany({
            include: {
                item: true,
            },
        });

        return stocks.filter(
            (stock) =>
                stock.currentStockPieces <=
                stock.item.reorderLevel
        );
    },
};