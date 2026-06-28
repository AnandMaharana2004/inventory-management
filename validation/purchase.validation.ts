import { z } from "zod";

const purchaseDetailSchema = z
    .object({
        itemId: z.number().int().positive("itemId is required."),
        packQty: z.number().int().nonnegative("packQty cannot be negative."),
        looseQty: z.number().int().nonnegative("looseQty cannot be negative."),
        purchaseRate: z.number().positive("purchaseRate must be greater than 0."),
        discountPct: z
            .number()
            .min(0, "discountPct cannot be negative.")
            .max(100, "discountPct cannot exceed 100.")
            .optional()
            .default(0),
    })
    .refine((data) => data.packQty > 0 || data.looseQty > 0, {
        message: "At least one of packQty or looseQty must be greater than 0.",
        path: ["packQty"],
    });

export const createPurchaseSchema = z.object({
    poDate: z.coerce.date(),
    invoiceNumber: z.string().optional(),
    vendorId: z.number().int().positive("vendorId is required."),
    details: z.array(purchaseDetailSchema).min(1, "At least one item line is required."),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;