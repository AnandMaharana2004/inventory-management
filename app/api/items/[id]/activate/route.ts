import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { itemService } from "@/services/item.service";

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid item id.");
        }

        const item = await itemService.ActivateItem(id);

        return Response.json(new ApiResponse("Item activated successfully", item));
    } catch (error) {
        return authErrorResponse(error);
    }
}