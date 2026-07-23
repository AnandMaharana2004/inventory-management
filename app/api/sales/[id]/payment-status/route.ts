// app/api/sales/[id]/payment-status/route.ts
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { saleService } from "@/services/sale.service";
import { saleIdParamSchema, updatePaymentStatusSchema } from "@/validation/sale.validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        // Authenticate
        const authUser = await AuthenticatinNeed(request);

        // Authorize — any role can update payment status
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER, UserRole.SALESMAN);

        const { id } = await params;
        const idResult = saleIdParamSchema.safeParse({ id });
        if (!idResult.success) {
            throw new BadRequestError(idResult.error.issues[0]?.message);
        }

        const body = await request.json();
        const bodyResult = updatePaymentStatusSchema.safeParse(body);
        if (!bodyResult.success) {
            throw new BadRequestError(bodyResult.error.issues[0]?.message);
        }

        // Business Logic
        const sale = await saleService.UpdatePaymentStatus(idResult.data.id, bodyResult.data);

        return Response.json(new ApiResponse("Payment status updated successfully", sale));
    } catch (error) {
        return authErrorResponse(error);
    }
}