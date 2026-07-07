import { z } from "zod";

export const purchaseDetailLineSchema = z.object({
  itemId: z.number({ message: "Item selection is required" }).int().positive("Invalid item identifier"),
  packQty: z.number({ message: "Pack Qty must be a number" }).min(0, "Cannot be negative"),
  looseQty: z.number({ message: "Loose Qty must be a number" }).min(0, "Cannot be negative"),
  purchaseRate: z.number({ message: "Purchase rate must be a number" }).min(0.01, "Rate must be greater than 0"),
  discountPct: z.number({ message: "Discount % must be a number" }).min(0, "Cannot be negative").max(100, "Max 100%"),
  rateBasis: z.enum([
    "PIECE_EXCL_GST",
    "PIECE_INCL_GST",
    "PACK_EXCL_GST",
    "PACK_INCL_GST",
  ], { message: "Invalid rate configuration basis select option" }),
}).refine((data) => data.packQty > 0 || data.looseQty > 0, {
  message: "At least one of packQty or looseQty must be greater than 0",
  path: ["packQty"],
});

export const purchaseSchema = z.object({
  poDate: z.string().min(1, "Purchase order date is required"),
  invoiceNumber: z.string().max(50, "Invoice number must be at most 50 characters").optional().nullable(),
  vendorId: z.number({ message: "Please select a merchant supplier" }).int().positive("Invalid vendor identifier"),
  details: z.array(purchaseDetailLineSchema).min(1, "Transaction matrix requires at least 1 item line"),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function formValuesToApi(values: PurchaseFormValues) {
  return {
    ...values,
    invoiceNumber: values.invoiceNumber?.trim() || undefined,
    poDate: new Date(values.poDate).toISOString(),
    details: values.details.map((line) => ({
      itemId: line.itemId,
      packQty: line.packQty,
      looseQty: line.looseQty,
      purchaseRate: line.purchaseRate,
      discountPct: line.discountPct,
      rateBasis: line.rateBasis,
    })),
  };
}