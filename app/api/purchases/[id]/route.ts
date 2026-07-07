import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { purchaseService } from "@/services/purchase.service";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    { params }: RouteParams
) {
    try {
        // Authenticate
        await AuthenticatinNeed(request);

        const { id } = await params;

        const purchaseId = Number(id);
        if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
            throw new BadRequestError("Invalid purchase id.");
        }

        // Business Logic
        const purchase = await purchaseService.GetPurchaseById(purchaseId);

        return Response.json(
            new ApiResponse("Purchase order fetched successfully", purchase)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}