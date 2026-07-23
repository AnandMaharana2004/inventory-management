// app/api/sales/[id]/cancel/route.ts
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { saleService } from "@/services/sale.service";
import { saleIdParamSchema } from "@/validation/sale.validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — any role can cancel a sale
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESMAN);

        const { id } = await params;
        const result = saleIdParamSchema.safeParse({ id });
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        // Business Logic
        await saleService.CancelSale(result.data.id);

        return Response.json(new ApiResponse("Sale cancelled successfully"));
    } catch (error) {
        return authErrorResponse(error);
    }
}