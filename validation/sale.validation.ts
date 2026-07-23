// validation/sale.validation.ts
import { z } from "zod";
import { PaymentStatus } from "@/lib/generated/prisma/enums";

// A discount entered by the salesman — either a % or a flat rupee amount.
// Used both per line item and at the bill level.
const manualDiscountSchema = z
    .object({
        type: z.enum(["PERCENT", "FLAT"]),
        value: z.coerce.number().nonnegative(),
    })
    .optional();

export const saleLineItemSchema = z
    .object({
        itemId: z.coerce.number().int().positive(),
        packQty: z.coerce.number().int().nonnegative().default(0),
        looseQty: z.coerce.number().int().nonnegative().default(0),
        saleRate: z.coerce.number().positive(),
        discount: manualDiscountSchema,
    })
    .refine((d) => d.packQty > 0 || d.looseQty > 0, {
        message: "Either packQty or looseQty must be greater than 0",
        path: ["packQty"],
    });

export const createSaleSchema = z.object({
    customerId: z.coerce.number().int().positive(),
    billDate: z.coerce.date(),
    paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),

    // Bill-level toggle — when true, eligible Discount records are auto-applied
    // across the whole bill. When false, no default discounts apply at all.
    applyDefaultDiscounts: z.coerce.boolean().default(true),

    // Manual discount on the bill total, stacks on top of line-level and
    // default discounts.
    billDiscount: manualDiscountSchema,

    details: z
        .array(saleLineItemSchema)
        .min(1, "At least one line item is required"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export const updatePaymentStatusSchema = z.object({
    paymentStatus: z.nativeEnum(PaymentStatus),
});

export type UpdatePaymentStatusInput = z.infer<
    typeof updatePaymentStatusSchema
>;

export const saleIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export type SaleIdParam = z.infer<typeof saleIdParamSchema>;

export const customerIdParamSchema = z.object({
    customerId: z.coerce.number().int().positive(),
});

export type CustomerIdParam = z.infer<typeof customerIdParamSchema>;

export const saleDateRangeQuerySchema = z
    .object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    })
    .refine((d) => d.startDate <= d.endDate, {
        message: "startDate must be before endDate",
        path: ["startDate"],
    });

export type SaleDateRangeQuery = z.infer<typeof saleDateRangeQuerySchema>;