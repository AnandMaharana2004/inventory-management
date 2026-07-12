import { z } from "zod";

export const clientOpeningStockSchema = z.object({
  itemId: z.number({ message: "Item selection is required" }).int().positive("Invalid item identifier"),
  quantity: z.number({ message: "Quantity must be a number" }).int().nonnegative("Quantity cannot be negative"),
  unitCost: z.number({ message: "Unit cost must be a number" }).min(0, "Cost cannot be negative").optional().or(z.literal("")),
  remarks: z.string().optional(),
});

export const clientAdjustStockSchema = z.object({
  itemId: z.number({ message: "Item selection is required" }).int().positive("Invalid item identifier"),
  adjustmentType: z.enum(["INCREASE", "DECREASE"], { message: "Select a valid adjustment action" }),
  quantity: z.number({ message: "Quantity must be a number" }).int().positive("Quantity must be greater than 0"),
  remarks: z.string().min(1, "Remarks are mandatory for audit trail logs"),
});

export type OpeningStockFormValues = z.infer<typeof clientOpeningStockSchema>;
export type AdjustStockFormValues = z.infer<typeof clientAdjustStockSchema>;

export function openingFormToApi(values: OpeningStockFormValues) {
  return {
    itemId: values.itemId,
    quantity: values.quantity,
    unitCost: values.unitCost !== "" && values.unitCost !== undefined ? Number(values.unitCost) : undefined,
    remarks: values.remarks?.trim() || undefined,
  };
}

export function adjustFormToApi(values: AdjustStockFormValues) {
  return {
    itemId: values.itemId,
    adjustmentType: values.adjustmentType,
    quantity: values.quantity,
    remarks: values.remarks.trim(),
  };
}