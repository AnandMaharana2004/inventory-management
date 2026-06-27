// activate/route.ts
import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { userService } from "@/services/user.service";

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid user id.");
        }

        const user = await userService.DeactivateUser(id);

        return Response.json(new ApiResponse("User deactivated successfully", user));
    } catch (error) {
        return authErrorResponse(error);
    }
}