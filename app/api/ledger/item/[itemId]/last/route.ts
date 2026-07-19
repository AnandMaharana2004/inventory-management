import { NextRequest } from "next/server";
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { ledgerService } from "@/services/ledger.service";

type RouteParams = {
    params: Promise<{
        itemId: string;
    }>;
};

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const { itemId } = await params;

        const id = Number(itemId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid item id.");
        }

        const entry = await ledgerService.GetItemLastLedger(id);

        return Response.json(
            new ApiResponse(
                "Last ledger entry fetched successfully",
                entry
            )
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}