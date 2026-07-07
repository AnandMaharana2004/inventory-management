import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "User name is required").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address").or(z.string().length(0)).optional().nullable(),
  role: z.enum(["ADMIN", "MANAGER", "SALESMAN"], {
    message: "Please select a valid user role",
  }),
  contactNumber: z.string().max(20, "Contact number must be at most 20 characters").optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.string().length(0)),
});

export type UserFormValues = z.infer<typeof userSchema>;

// Converts form payload values into explicit backend parameters shapes safely
export function formValuesToApi(values: UserFormValues, mode: "create" | "edit") {
  const payload: any = {
    name: values.name.trim(),
    role: values.role,
    email: values.email?.trim() || undefined,
    contactNumber: values.contactNumber?.trim() || undefined,
  };

  if (mode === "create") {
    payload.password = values.password || "";
  }

  return payload;
}