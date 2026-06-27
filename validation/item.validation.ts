import { z } from "zod";

export const createItemSchema = z.object({
    itemCode: z.string().min(1, "Item code is required."),
    itemDesc: z.string().min(1, "Item description is required."),
    hsnCode: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    packSize: z.number().int().positive("Pack size must be a positive integer."),
    unitName: z.string().min(1, "Unit name is required."),
    gstPct: z.number().min(0, "GST % cannot be negative.").max(100, "GST % cannot exceed 100."),
    reorderLevel: z.number().int().nonnegative().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

// Same rules as create, but every field optional — partial update via PATCH
export const updateItemSchema = createItemSchema.partial();

export type UpdateItemInput = z.infer<typeof updateItemSchema>;