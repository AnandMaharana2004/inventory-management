import { z } from "zod";

export const createDamageSchema = z
    .object({
        damageDate: z.coerce.date(),
        itemId: z.number().int().positive("itemId is required."),
        packQty: z.number().int().nonnegative("packQty cannot be negative."),
        looseQty: z.number().int().nonnegative("looseQty cannot be negative."),
        reason: z.string().optional(),
        estimatedLoss: z.number().nonnegative("estimatedLoss cannot be negative.").optional(),
    })
    .refine((data) => data.packQty > 0 || data.looseQty > 0, {
        message: "At least one of packQty or looseQty must be greater than 0.",
        path: ["packQty"],
    });

export type CreateDamageInput = z.infer<typeof createDamageSchema>;