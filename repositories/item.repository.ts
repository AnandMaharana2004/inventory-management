import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateItemInput = {
    itemCode: string;
    itemDesc: string;
    hsnCode?: string;
    category?: string;
    brand?: string;
    packSize: number;
    unitName: string;
    gstPct: Prisma.Decimal | number;
    reorderLevel?: number;
};

export const itemRepository = {
    async create(data: CreateItemInput) {
        return prisma.itemMaster.create({
            data,
        });
    },

    async getItemById(id: number) {
        return prisma.itemMaster.findUnique({
            where: {
                id,
            },
        });
    },

    async getItemByCode(itemCode: string) {
        return prisma.itemMaster.findUnique({
            where: {
                itemCode,
            },
        });
    },

    async getItemByName(itemDesc: string) {
        return prisma.itemMaster.findMany({
            where: {
                itemDesc: {
                    contains: itemDesc,
                    mode: "insensitive",
                },
            },
            orderBy: {
                itemDesc: "asc",
            },
        });
    },

    async getAllItems() {
        return prisma.itemMaster.findMany({
            orderBy: {
                itemDesc: "asc",
            },
        });
    },

    async getActiveItems() {
        return prisma.itemMaster.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                itemDesc: "asc",
            },
        });
    },

    async updateItem(
        id: number,
        data: Prisma.ItemMasterUpdateInput
    ) {
        return prisma.itemMaster.update({
            where: {
                id,
            },
            data,
        });
    },

    async activateItem(id: number) {
        return prisma.itemMaster.update({
            where: {
                id,
            },
            data: {
                isActive: true,
            },
        });
    },

    async deactivateItem(id: number) {
        return prisma.itemMaster.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });
    },

    async deleteItem(id: number) {
        return prisma.itemMaster.delete({
            where: {
                id,
            },
        });
    },

    async getItemWithStock(id: number) {
        return prisma.itemMaster.findUnique({
            where: {
                id,
            },
            include: {
                stock: true,
            },
        });
    },

    async getItemWithPurchaseHistory(id: number) {
        return prisma.itemMaster.findUnique({
            where: {
                id,
            },
            include: {
                poDetails: {
                    orderBy: {
                        po: {
                            poDate: "desc",
                        },
                    },
                },
            },
        });
    },

    async getItemWithSalesHistory(id: number) {
        return prisma.itemMaster.findUnique({
            where: {
                id,
            },
            include: {
                billDetails: {
                    orderBy: {
                        bill: {
                            billDate: "desc",
                        },
                    },
                },
            },
        });
    },

    async searchItems(search: string) {
        return prisma.itemMaster.findMany({
            where: {
                OR: [
                    {
                        itemCode: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        itemDesc: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        category: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        brand: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            take: 20,
            orderBy: {
                itemDesc: "asc",
            },
        });
    },
};