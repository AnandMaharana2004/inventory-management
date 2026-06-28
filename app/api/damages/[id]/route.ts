import { UserRole } from "@/lib/generated/prisma/client";
import { AuthenticatinNeed, authErrorResponse } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { ApiResponse, BadRequestError } from "@/lib/response";
import { damageService } from "@/services/damage.service";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const authUser = await AuthenticatinNeed(request);
        requireRole(authUser, UserRole.ADMIN, UserRole.MANAGER);

        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("Invalid damage id.");
        }

        const damage = await damageService.GetDamageById(id);

        return Response.json(new ApiResponse("Damage record fetched successfully", damage));
    } catch (error) {
        return authErrorResponse(error);
    }
}