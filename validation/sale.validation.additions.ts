import { z } from "zod";
import { PaymentStatus } from "@/lib/generated/prisma/enums";

export const listSalesQuerySchema = z
    .object({
        customerId: z.coerce.number().int().positive().optional(),
        paymentStatus: z.nativeEnum(PaymentStatus).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
    })
    .refine((d) => (d.startDate && d.endDate ? d.startDate <= d.endDate : true), {
        message: "startDate must be before or equal to endDate",
        path: ["startDate"],
    });

export type ListSalesQuery = z.infer<typeof listSalesQuerySchema>;

