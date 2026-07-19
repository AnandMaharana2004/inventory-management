import { z } from "zod";

export const saleDetailLineSchema = z.object({
  itemId: z.number({ message: "Item selection is required" }).int().positive("Invalid item identifier"),
  packQty: z.number({ message: "Pack Qty must be a number" }).min(0, "Cannot be negative"),
  looseQty: z.number({ message: "Loose Qty must be a number" }).min(0, "Cannot be negative"),
  saleRate: z.number({ message: "Sale rate must be a number" }).min(0.01, "Rate must be greater than 0"),
}).refine((data) => data.packQty > 0 || data.looseQty > 0, {
  message: "At least one of packQty or looseQty must be greater than 0",
  path: ["packQty"],
});

export const saleSchema = z.object({
  billDate: z.string().min(1, "Billing transaction date is required"),
  customerId: z.number({ message: "Customer selection is required" }).int().positive("Invalid customer identifier"),
  paymentStatus: z.enum(["PAID", "PARTIAL", "PENDING"], {
    message: "Please pick a valid initial payment status state",
  }),
  details: z.array(saleDetailLineSchema).min(1, "Transaction matrix requires at least 1 retail item row"),
});

export type SaleFormValues = z.infer<typeof saleSchema>;

export function formValuesToApi(values: SaleFormValues) {
  return {
    billDate: new Date(values.billDate).toISOString(),
    customerId: values.customerId,
    paymentStatus: values.paymentStatus,
    details: values.details.map((l) => ({
      itemId: l.itemId,
      packQty: l.packQty,
      looseQty: l.looseQty,
      saleRate: l.saleRate,
    })),
  };
}