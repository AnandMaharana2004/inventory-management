import { z } from "zod";
import { ReferenceType } from "@/lib/generated/prisma/enums";

// Query-param validation only — there's no create schema here,
// since ledger entries are never created directly via this API.
export const ledgerQuerySchema = z.object({
    itemId: z.coerce.number().int().positive().optional(),
    referenceType: z.nativeEnum(ReferenceType).optional(),
    referenceId: z.coerce.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
}).refine(
    (data) => !data.referenceId || data.referenceType,
    { message: "referenceType is required when referenceId is provided.", path: ["referenceType"] }
).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    { message: "startDate must be before endDate.", path: ["endDate"] }
);

export type LedgerQueryInput = z.infer<typeof ledgerQuerySchema>;