import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateCustomerInput = {
    name: string;
    mobileNo?: string;
    gstin?: string;
    contactPerson?: string;
    address?: string;
    city?: string;
};

export const customerRepository = {
    async create(data: CreateCustomerInput) {
        return prisma.customer.create({
            data,
        });
    },

    async getCustomerById(id: number) {
        return prisma.customer.findUnique({
            where: {
                id,
            },
        });
    },

    async getCustomerByName(name: string) {
        return prisma.customer.findMany({
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

    async getCustomerByMobile(mobileNo: string) {
        return prisma.customer.findFirst({
            where: {
                mobileNo,
            },
        });
    },

    async getCustomerByGstin(gstin: string) {
        return prisma.customer.findFirst({
            where: {
                gstin,
            },
        });
    },

    async getAllCustomers() {
        return prisma.customer.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async updateCustomer(
        id: number,
        data: Prisma.CustomerUpdateInput
    ) {
        return prisma.customer.update({
            where: {
                id,
            },
            data,
        });
    },

    async deleteCustomer(id: number) {
        return prisma.customer.delete({
            where: {
                id,
            },
        });
    },

    async getCustomerWithBills(id: number) {
        return prisma.customer.findUnique({
            where: {
                id,
            },
            include: {
                bills: {
                    orderBy: {
                        billDate: "desc",
                    },
                },
            },
        });
    },
    async searchCustomers(search: string) {
        return prisma.customer.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        mobileNo: {
                            contains: search,
                        },
                    },
                    {
                        gstin: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            take: 20,
        });
    }
};