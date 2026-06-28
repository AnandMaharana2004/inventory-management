import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { ledgerService } from "@/services/ledger.service";
import { ledgerQuerySchema } from "@/validation/ledger.validation";

export async function GET(request: Request) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — stock ledger is an internal audit trail, not salesman-facing
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        // Validate query params
        const { searchParams } = new URL(request.url);
        const result = ledgerQuerySchema.safeParse({
            itemId: searchParams.get("itemId") ?? undefined,
            referenceType: searchParams.get("referenceType") ?? undefined,
            referenceId: searchParams.get("referenceId") ?? undefined,
            startDate: searchParams.get("startDate") ?? undefined,
            endDate: searchParams.get("endDate") ?? undefined,
        });
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        const entries = await ledgerService.ListLedger(result.data);

        return Response.json(new ApiResponse("Ledger entries fetched successfully", entries));
    } catch (error) {
        return authErrorResponse(error);
    }
}