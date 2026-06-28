import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { ledgerService } from "@/services/ledger.service";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid ledger entry id.");
        }

        const entry = await ledgerService.GetLedgerById(id);

        return Response.json(new ApiResponse("Ledger entry fetched successfully", entry));
    } catch (error) {
        return authErrorResponse(error);
    }
}