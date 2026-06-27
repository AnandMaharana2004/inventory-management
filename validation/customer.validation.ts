import { z } from "zod";

export const createCustomerSchema = z.object({
    name: z.string().min(1, "Customer name is required."),
    mobileNo: z.string().min(10, "Mobile number must be at least 10 digits.").optional(),
    gstin: z
        .string()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format.")
        .optional(),
    contactPerson: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

// Same rules as create, but every field optional — partial update via PATCH
export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;