import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { userService } from "@/services/user.service";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: Request,
    { params }: RouteParams
) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN);

        const { id } = await params;

        const userId = Number(id);

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new BadRequestError("Invalid user id.");
        }

        const user = await userService.ActivateUser(userId);

        return Response.json(
            new ApiResponse("User activated successfully", user)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}