import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(100, "Name must be at most 100 characters"),
  gstin: z.string().max(15, "GSTIN must be at most 15 characters").optional().nullable(),
  location: z.string().max(200, "Location must be at most 200 characters").optional().nullable(),
  contactPerson: z.string().max(100, "Contact person must be at most 100 characters").optional().nullable(),
  contactNumber: z.string().max(20, "Contact number must be at most 20 characters").optional().nullable(),
  email: z.string().email("Invalid email address").or(z.string().length(0)).optional().nullable(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

// Transform helper to convert empty form fields to undefined for clean API delivery
export function formValuesToApi(values: VendorFormValues) {
  return {
    ...values,
    gstin: values.gstin?.trim() || undefined,
    location: values.location?.trim() || undefined,
    contactPerson: values.contactPerson?.trim() || undefined,
    contactNumber: values.contactNumber?.trim() || undefined,
    email: values.email?.trim() || undefined,
  };
}