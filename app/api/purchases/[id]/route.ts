import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { purchaseService } from "@/services/purchase.service";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        await AuthenticatinNeed(request);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid purchase id.");
        }

        // Business Logic
        const purchase = await purchaseService.GetPurchaseById(id);

        return Response.json(new ApiResponse("Purchase order fetched successfully", purchase));
    } catch (error) {
        return authErrorResponse(error);
    }
}