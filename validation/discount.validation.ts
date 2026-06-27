import { z } from "zod";
import { DiscountAttribute } from "@/lib/generated/prisma/enums";

export const createDiscountSchema = z
    .object({
        onItemId: z.number().int().positive("onItemId is required."),
        discountedItemId: z.number().int().positive("discountedItemId is required."),
        perAttribute: z.nativeEnum(DiscountAttribute, {
            error: "Invalid perAttribute value.",
        }),
        attributeQty: z.number().positive("attributeQty must be greater than 0."),
        discountedAttribute: z.nativeEnum(DiscountAttribute, {
            error: "Invalid discountedAttribute value.",
        }),
        discountedQty: z.number().positive("discountedQty must be greater than 0."),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    })
    .refine((data) => data.startDate < data.endDate, {
        message: "Start date must be before end date.",
        path: ["endDate"],
    });

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;