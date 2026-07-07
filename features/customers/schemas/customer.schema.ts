import { z } from "zod";

export const customerSchema = z.object({
    name: z.string().min(1, "Customer name is required").max(100, "Name must be at most 100 characters"),
    mobileNo: z.string().max(20, "Mobile number must be at most 20 characters").optional().nullable(),
    gstin: z.string().max(15, "GSTIN must be at most 15 characters").optional().nullable(),
    contactPerson: z.string().max(100, "Contact person must be at most 100 characters").optional().nullable(),
    address: z.string().max(200, "Address must be at most 200 characters").optional().nullable(),
    city: z.string().max(50, "City must be at most 50 characters").optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// Transform helper to convert empty form strings to undefined for clean API delivery
export function formValuesToApi(values: CustomerFormValues) {
    return {
        ...values,
        mobileNo: values.mobileNo?.trim() || undefined,
        gstin: values.gstin?.trim() || undefined,
        contactPerson: values.contactPerson?.trim() || undefined,
        address: values.address?.trim() || undefined,
        city: values.city?.trim() || undefined,
    };
}