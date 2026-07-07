import { z } from "zod";

export const itemSchema = z.object({
  itemCode: z.string()
    .min(1, "Item code is required")
    .max(50, "Item code must be at most 50 characters"),
  itemDesc: z.string()
    .min(1, "Item description is required")
    .max(200, "Item description must be at most 200 characters"),
  hsnCode: z.string()
    .max(20, "HSN code must be at most 20 characters")
    .optional()
    .nullable(),
  category: z.string()
    .max(50, "Category must be at most 50 characters")
    .optional()
    .nullable(),
  brand: z.string()
    .max(50, "Brand must be at most 50 characters")
    .optional()
    .nullable(),
  packSize: z.number({ message: "Pack size must be a number" })
    .min(1, "Pack size must be at least 1")
    .int("Pack size must be a whole number"),
  unitName: z.string()
    .min(1, "Unit name is required")
    .max(20, "Unit name must be at most 20 characters"),
  gstPct: z.number({ message: "GST percentage must be a number" })
    .min(0, "GST percentage must be at least 0")
    .max(100, "GST percentage must be at most 100"),
  reorderLevel: z.number({ message: "Reorder level must be a number" })
    .min(0, "Reorder level must be at least 0")
    .int("Reorder level must be a whole number")
    .default(0),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

// Helper to convert form values to API format (null or empty string -> undefined)
export function formValuesToApi(values: ItemFormValues) {
  return {
    ...values,
    hsnCode: values.hsnCode?.trim() || undefined,
    category: values.category?.trim() || undefined,
    brand: values.brand?.trim() || undefined,
  };
}