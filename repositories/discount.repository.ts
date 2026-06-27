import { Prisma } from "@/lib/generated/prisma/client";
import { DiscountAttribute } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

type CreateDiscountInput = {
    onItemId: number;
    discountedItemId: number;
    perAttribute: DiscountAttribute;
    attributeQty: Prisma.Decimal | number;
    discountedAttribute: DiscountAttribute;
    discountedQty: Prisma.Decimal | number;
    startDate: Date;
    endDate: Date;
    createdById?: number;
};

export const discountRepository = {
    async create(data: CreateDiscountInput) {
        return prisma.discount.create({
            data,
        });
    },

    async getDiscountById(id: number) {
        return prisma.discount.findUnique({
            where: {
                id,
            },
            include: {
                onItem: true,
                discountedItem: true,
            },
        });
    },

    async getAllDiscounts() {
        return prisma.discount.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                onItem: true,
                discountedItem: true,
            },
        });
    },

    async getActiveDiscounts() {
        return prisma.discount.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                startDate: "desc",
            },
            include: {
                onItem: true,
                discountedItem: true,
            },
        });
    },

    // Active AND within date range right now — what the sales/billing engine should query
    async getCurrentDiscounts(onDate: Date = new Date()) {
        return prisma.discount.findMany({
            where: {
                isActive: true,
                startDate: { lte: onDate },
                endDate: { gte: onDate },
            },
            include: {
                onItem: true,
                discountedItem: true,
            },
        });
    },

    // Discounts triggered by this item being purchased
    async getDiscountsByOnItem(onItemId: number) {
        return prisma.discount.findMany({
            where: {
                onItemId,
            },
            orderBy: {
                startDate: "desc",
            },
        });
    },

    // Discounts where this item is the one receiving the discount
    async getDiscountsByDiscountedItem(discountedItemId: number) {
        return prisma.discount.findMany({
            where: {
                discountedItemId,
            },
            orderBy: {
                startDate: "desc",
            },
        });
    },

    // Used by the service to block overlapping active discounts for the same item pair
    async getOverlappingDiscounts(
        onItemId: number,
        discountedItemId: number,
        startDate: Date,
        endDate: Date,
        excludeId?: number
    ) {
        return prisma.discount.findMany({
            where: {
                onItemId,
                discountedItemId,
                isActive: true,
                id: excludeId ? { not: excludeId } : undefined,
                startDate: { lte: endDate },
                endDate: { gte: startDate },
            },
        });
    },

    async updateDiscount(
        id: number,
        data: Prisma.DiscountUpdateInput
    ) {
        return prisma.discount.update({
            where: {
                id,
            },
            data,
        });
    },

    async activateDiscount(id: number) {
        return prisma.discount.update({
            where: {
                id,
            },
            data: {
                isActive: true,
            },
        });
    },

    async deactivateDiscount(id: number) {
        return prisma.discount.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });
    },

    async deleteDiscount(id: number) {
        return prisma.discount.delete({
            where: {
                id,
            },
        });
    },
};