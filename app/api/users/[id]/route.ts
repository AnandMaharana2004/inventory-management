import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { userService } from "@/services/user.service";
import { updateUserSchema } from "@/validation/user.validation";

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

function parseId(idParam: string) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid user id.");
    }

    return id;
}

export async function GET(
    request: Request,
    { params }: RouteParams
) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN);

        const { id } = await params;
        const user = await userService.GetUserById(parseId(id));

        return Response.json(
            new ApiResponse("User fetched successfully", user)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function PATCH(
    request: Request,
    { params }: RouteParams
) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN);

        const { id } = await params;
        const userId = parseId(id);

        const body = await request.json();

        const result = updateUserSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestError(result.error.issues[0]?.message);
        }

        const user = await userService.UpdateUser(userId, result.data);

        return Response.json(
            new ApiResponse("User updated successfully", user)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: RouteParams
) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN);

        const { id } = await params;

        await userService.DeleteUser(parseId(id));

        return Response.json(
            new ApiResponse("User deleted successfully", null)
        );
    } catch (error) {
        return authErrorResponse(error);
    }
}