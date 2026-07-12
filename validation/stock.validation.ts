import { z } from "zod";

// ── Opening Stock ────────────────────────────────────────────────

export const createOpeningStockSchema = z.object({
    itemId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().nonnegative(),
    unitCost: z.coerce.number().nonnegative().optional(),
    remarks: z.string().optional(),
});

export type CreateOpeningStockInput = z.infer<typeof createOpeningStockSchema>;

// ── Stock Adjustment ─────────────────────────────────────────────

export const adjustStockSchema = z.object({
    itemId: z.coerce.number().int().positive(),
    adjustmentType: z.enum(["INCREASE", "DECREASE"]),
    quantity: z.coerce.number().int().positive(),
    remarks: z
        .string()
        .min(1, "Remarks are required for stock adjustments"),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

// ── Shared param schema ──────────────────────────────────────────

export const itemIdParamSchema = z.object({
    itemId: z.coerce.number().int().positive(),
});

export type ItemIdParam = z.infer<typeof itemIdParamSchema>;