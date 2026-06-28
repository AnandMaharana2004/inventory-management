import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { saleService } from "@/services/sale.service";
import { updatePaymentStatusSchema } from "@/validation/sale.validation";

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const authUser = await AuthenticatinNeed(request);

        // Payment/collections tracking — admin or manager only, not salesman
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid sale id.");
        }

        const body = await request.json();
        const result = updatePaymentStatusSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        const sale = await saleService.UpdatePaymentStatus(id, result.data.paymentStatus);

        return Response.json(new ApiResponse("Payment status updated successfully", sale));
    } catch (error) {
        return authErrorResponse(error);
    }
}