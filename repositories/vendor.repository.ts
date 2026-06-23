import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateVendorInput = {
    name: string;
    gstin?: string;
    location?: string;
    contactPerson?: string;
    contactNumber?: string;
    email?: string;
};

export const vendorRepository = {
    async create(data: CreateVendorInput) {
        return prisma.vendor.create({
            data,
        });
    },

    async getVendorById(id: number) {
        return prisma.vendor.findUnique({
            where: {
                id,
            },
        });
    },

    async getVendorByName(name: string) {
        return prisma.vendor.findMany({
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

    async getVendorByGstin(gstin: string) {
        return prisma.vendor.findFirst({
            where: {
                gstin,
            },
        });
    },

    async getAllVendors() {
        return prisma.vendor.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async updateVendor(
        id: number,
        data: Prisma.VendorUpdateInput
    ) {
        return prisma.vendor.update({
            where: {
                id,
            },
            data,
        });
    },

    async deleteVendor(id: number) {
        return prisma.vendor.delete({
            where: {
                id,
            },
        });
    },
};