import { z } from "zod";

export const discountSchema = z.object({
    onItemId: z.number({ message: "Please select an offer item" })
        .int("Item ID must be a valid ID"),
    discountedItemId: z.number({ message: "Please select a discounted item" })
        .int("Item ID must be a valid ID"),
    perAttribute: z.enum(["PER_ITEM", "PER_PACK", "PER_AMOUNT"], {
        message: "Please select an attribute",
    }),
    attributeQty: z.number({ message: "Quantity is required" })
        .min(0.01, "Quantity must be greater than 0"),
    discountedAttribute: z.enum(["PER_ITEM", "PER_PACK", "PER_AMOUNT"], {
        message: "Please select a discounted attribute",
    }),
    discountedQty: z.number({ message: "Discounted quantity is required" })
        .min(0.01, "Quantity must be greater than 0"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be greater than or equal to start date",
    path: ["endDate"],
});

export type DiscountFormValues = z.infer<typeof discountSchema>;

// Helper to convert form values to API format cleanly
export function formValuesToApi(values: DiscountFormValues) {
    return {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
    };
}