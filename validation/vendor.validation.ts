import { z } from "zod";

export const createVendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required."),
    gstin: z
        .string()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format.")
        .optional(),
    location: z.string().optional(),
    contactPerson: z.string().optional(),
    contactNumber: z.string().optional(),
    email: z.string().email("Invalid email address.").optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;

// Same rules as create, but every field optional — partial update via PATCH
export const updateVendorSchema = createVendorSchema.partial();

export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;