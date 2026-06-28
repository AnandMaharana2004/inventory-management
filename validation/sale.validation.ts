import { z } from "zod";
import { PaymentStatus } from "@/lib/generated/prisma/enums";

const saleDetailSchema = z
    .object({
        itemId: z.number().int().positive("itemId is required."),
        packQty: z.number().int().nonnegative("packQty cannot be negative."),
        looseQty: z.number().int().nonnegative("looseQty cannot be negative."),
        saleRate: z.number().positive("saleRate must be greater than 0."),
    })
    .refine((data) => data.packQty > 0 || data.looseQty > 0, {
        message: "At least one of packQty or looseQty must be greater than 0.",
        path: ["packQty"],
    });

export const createSaleSchema = z.object({
    billDate: z.coerce.date(),
    customerId: z.number().int().positive("customerId is required."),
    paymentStatus: z.nativeEnum(PaymentStatus, {
        error: "Invalid payment status.",
    }),
    details: z.array(saleDetailSchema).min(1, "At least one item line is required."),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export const updatePaymentStatusSchema = z.object({
    paymentStatus: z.nativeEnum(PaymentStatus, {
        error: "Invalid payment status.",
    }),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;